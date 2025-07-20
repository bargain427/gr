from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class DNAProvider(str, Enum):
    TWENTY_THREE_AND_ME = "23andme"
    ANCESTRY_DNA = "ancestrydna"
    MY_HERITAGE = "myheritage"
    FAMILY_TREE_DNA = "familytreedna"
    GENERIC = "generic"

class AnalysisStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    FAILED = "failed"

class GeneticMarker(BaseModel):
    rsid: str  # Reference SNP cluster ID
    chromosome: str
    position: int
    genotype: str
    risk_allele: Optional[str] = None
    effect: Optional[str] = None
    confidence: Optional[float] = None

class DNAReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    provider: DNAProvider
    file_size: int
    analysis_status: AnalysisStatus = AnalysisStatus.UPLOADED
    markers_analyzed: int = 0
    total_markers: int = 0
    genetic_markers: List[GeneticMarker] = []
    raw_data: Optional[Dict[str, Any]] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class DNAReportCreate(BaseModel):
    user_id: str
    filename: str
    provider: DNAProvider
    file_content: str  # Base64 encoded content

class DNAReportResponse(BaseModel):
    id: str
    filename: str
    provider: DNAProvider
    file_size: int
    analysis_status: AnalysisStatus
    markers_analyzed: int
    total_markers: int
    uploaded_at: datetime
    analyzed_at: Optional[datetime]
    error_message: Optional[str]