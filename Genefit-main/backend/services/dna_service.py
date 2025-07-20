import base64
import json
import re
from typing import List, Dict, Any, Optional
from models.dna import DNAReport, GeneticMarker, DNAProvider, AnalysisStatus
from models.user import User
import logging
import asyncio

logger = logging.getLogger(__name__)

class DNAAnalysisService:
    def __init__(self):
        # Common genetic markers for health analysis
        self.health_markers = {
            'rs7412': {'gene': 'APOE', 'condition': 'Alzheimer\'s risk', 'risk_allele': 'T'},
            'rs429358': {'gene': 'APOE', 'condition': 'Cardiovascular risk', 'risk_allele': 'C'},
            'rs1801282': {'gene': 'PPARG', 'condition': 'Type 2 Diabetes', 'risk_allele': 'G'},
            'rs1800497': {'gene': 'DRD2', 'condition': 'Addiction susceptibility', 'risk_allele': 'A'},
            'rs1815739': {'gene': 'ACTN3', 'condition': 'Athletic performance', 'risk_allele': 'T'},
            'rs1799752': {'gene': 'ACE', 'condition': 'Athletic endurance', 'risk_allele': 'D'},
            'rs1801133': {'gene': 'MTHFR', 'condition': 'Folate metabolism', 'risk_allele': 'T'},
            'rs2032582': {'gene': 'COMT', 'condition': 'Stress response', 'risk_allele': 'T'},
            'rs12255372': {'gene': 'TCF7L2', 'condition': 'Type 2 Diabetes', 'risk_allele': 'T'},
            'rs4988235': {'gene': 'LCT', 'condition': 'Lactose tolerance', 'risk_allele': 'C'},
        }

    async def process_dna_file(self, file_content: str, filename: str, provider: DNAProvider) -> List[GeneticMarker]:
        """Process DNA file content and extract genetic markers"""
        try:
            # Decode base64 content
            decoded_content = base64.b64decode(file_content).decode('utf-8')
            
            # Parse based on file format
            if filename.endswith('.txt'):
                markers = self._parse_23andme_format(decoded_content)
            elif filename.endswith('.csv'):
                markers = self._parse_csv_format(decoded_content)
            elif filename.endswith('.vcf'):
                markers = self._parse_vcf_format(decoded_content)
            else:
                # Try to auto-detect format
                markers = self._auto_detect_and_parse(decoded_content)
            
            # Filter for health-relevant markers
            health_markers = self._filter_health_markers(markers)
            
            logger.info(f"Processed {len(markers)} total markers, {len(health_markers)} health-relevant")
            return health_markers
            
        except Exception as e:
            logger.error(f"Error processing DNA file: {e}")
            raise ValueError(f"Failed to process DNA file: {str(e)}")

    def _parse_23andme_format(self, content: str) -> List[GeneticMarker]:
        """Parse 23andMe format (tab-separated)"""
        markers = []
        lines = content.strip().split('\n')
        
        for line in lines:
            if line.startswith('#') or not line.strip():
                continue
                
            parts = line.split('\t')
            if len(parts) >= 4:
                rsid = parts[0].strip()
                chromosome = parts[1].strip()
                position = parts[2].strip()
                genotype = parts[3].strip()
                
                if rsid.startswith('rs') and genotype != '--':
                    marker = GeneticMarker(
                        rsid=rsid,
                        chromosome=chromosome,
                        position=int(position) if position.isdigit() else 0,
                        genotype=genotype
                    )
                    markers.append(marker)
        
        return markers

    def _parse_csv_format(self, content: str) -> List[GeneticMarker]:
        """Parse CSV format (AncestryDNA, MyHeritage)"""
        markers = []
        lines = content.strip().split('\n')
        
        # Skip header if present
        start_idx = 1 if lines and ('rsid' in lines[0].lower() or 'chromosome' in lines[0].lower()) else 0
        
        for line in lines[start_idx:]:
            if not line.strip():
                continue
                
            parts = line.split(',')
            if len(parts) >= 4:
                rsid = parts[0].strip().strip('"')
                chromosome = parts[1].strip().strip('"')
                position = parts[2].strip().strip('"')
                genotype = parts[3].strip().strip('"')
                
                if rsid.startswith('rs') and genotype and genotype != '--':
                    marker = GeneticMarker(
                        rsid=rsid,
                        chromosome=chromosome,
                        position=int(position) if position.isdigit() else 0,
                        genotype=genotype
                    )
                    markers.append(marker)
        
        return markers

    def _parse_vcf_format(self, content: str) -> List[GeneticMarker]:
        """Parse VCF format"""
        markers = []
        lines = content.strip().split('\n')
        
        for line in lines:
            if line.startswith('#') or not line.strip():
                continue
                
            parts = line.split('\t')
            if len(parts) >= 10:  # VCF has at least 10 columns
                chromosome = parts[0].strip()
                position = parts[1].strip()
                rsid = parts[2].strip() if parts[2] != '.' else f"chr{chromosome}:{position}"
                ref = parts[3].strip()
                alt = parts[4].strip()
                genotype_data = parts[9].strip()
                
                # Parse genotype from FORMAT field
                genotype = self._parse_vcf_genotype(genotype_data, ref, alt)
                
                if genotype:
                    marker = GeneticMarker(
                        rsid=rsid,
                        chromosome=chromosome,
                        position=int(position) if position.isdigit() else 0,
                        genotype=genotype
                    )
                    markers.append(marker)
        
        return markers

    def _parse_vcf_genotype(self, genotype_data: str, ref: str, alt: str) -> str:
        """Parse genotype from VCF format"""
        try:
            # Simple GT field parsing (0/0, 0/1, 1/1, etc.)
            gt_match = re.search(r'^(\d)[/|](\d)', genotype_data)
            if gt_match:
                allele1 = gt_match.group(1)
                allele2 = gt_match.group(2)
                
                # Convert to actual nucleotides
                alleles = [ref if a == '0' else alt for a in [allele1, allele2]]
                return ''.join(sorted(alleles))
        except:
            pass
        return ""

    def _auto_detect_and_parse(self, content: str) -> List[GeneticMarker]:
        """Auto-detect file format and parse"""
        # Check if it looks like 23andMe format (tab-separated)
        if '\t' in content and 'rs' in content:
            return self._parse_23andme_format(content)
        
        # Check if it looks like CSV
        elif ',' in content and 'rs' in content:
            return self._parse_csv_format(content)
        
        # Check if it looks like VCF
        elif '#CHROM' in content or 'CHROM\tPOS' in content:
            return self._parse_vcf_format(content)
        
        else:
            raise ValueError("Unrecognized file format")

    def _filter_health_markers(self, markers: List[GeneticMarker]) -> List[GeneticMarker]:
        """Filter markers for health-relevant ones and add metadata"""
        health_markers = []
        
        for marker in markers:
            if marker.rsid in self.health_markers:
                marker_info = self.health_markers[marker.rsid]
                
                # Add health-related metadata
                marker.risk_allele = marker_info['risk_allele']
                marker.effect = marker_info['condition']
                
                # Calculate simple confidence based on known research
                marker.confidence = 0.85 if marker.rsid in ['rs7412', 'rs429358', 'rs1801133'] else 0.75
                
                health_markers.append(marker)
        
        return health_markers

    async def simulate_analysis_progress(self, dna_report_id: str, callback=None):
        """Simulate analysis progress for demo purposes"""
        total_markers = 900
        steps = [100, 250, 450, 650, 847, 900]
        
        for i, markers_analyzed in enumerate(steps):
            await asyncio.sleep(1.5)  # Simulate processing time
            
            if callback:
                await callback(dna_report_id, markers_analyzed, total_markers)
            
            logger.info(f"Analysis progress: {markers_analyzed}/{total_markers} markers")

    def get_genetic_summary(self, markers: List[GeneticMarker]) -> Dict[str, Any]:
        """Generate summary of genetic analysis"""
        summary = {
            'total_markers': len(markers),
            'conditions_analyzed': list(set(marker.effect for marker in markers if marker.effect)),
            'high_confidence_markers': len([m for m in markers if m.confidence and m.confidence > 0.8]),
            'genes_analyzed': list(set([
                self.health_markers[m.rsid]['gene'] 
                for m in markers 
                if m.rsid in self.health_markers
            ])),
        }
        
        return summary