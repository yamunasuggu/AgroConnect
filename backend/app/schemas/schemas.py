from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth & User Schemas ---

class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = "+91 98000 00000"
    password: str = "password123"
    role: str = "farmer"  # 'farmer' | 'buyer' | 'admin'
    location: str = "Guntur, Andhra Pradesh"
    farm_name: Optional[str] = None
    bio: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = "password123"
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
    location: str
    farmName: Optional[str] = None
    avatar: Optional[str] = None
    status: str
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse
    message: str

# --- Crop Schemas ---

class CropCreateRequest(BaseModel):
    farmer_id: str
    name: str
    category: str
    quantity: float
    unit: str = "kg"
    price_per_unit: float
    location: str
    harvest_date: str
    expected_delivery_date: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None

class CropUpdateRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    price_per_unit: Optional[float] = None
    status: Optional[str] = None

class CropResponse(BaseModel):
    id: str
    farmer_id: str
    farmer_name: str
    farmer_location: str
    name: str
    category: str
    quantity: float
    unit: str
    price_per_unit: float
    location: str
    harvest_date: str
    description: str
    image: str
    status: str
    rating: float
    reviews_count: int
    created_at: str

# --- Order Schemas ---

class OrderCreateRequest(BaseModel):
    buyer_id: str
    crop_id: str
    quantity: float
    delivery_address: str
    buyer_phone: str
    payment_method: Optional[str] = "AgroEscrow / Bank Transfer"

class OrderStatusUpdateRequest(BaseModel):
    status: str
    note: Optional[str] = None

class OrderReviewRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str

# --- AI Assistant Schemas ---

class AssistantChatRequest(BaseModel):
    message: str
    farmerId: Optional[str] = None
    contextCrop: Optional[str] = None

class MarketDemandResponse(BaseModel):
    crop_name: str
    active_listings: int
    available_quantity: float
    recent_orders: int
    requested_quantity: float
    sold_quantity: float
    average_price: float
    demand_ratio: float
    demand_indicator: str  # 'Low' | 'Moderate' | 'High'
    reason: str
    disclaimer: str

# --- Approved Knowledge Base Schemas ---

class ApprovedKnowledgeCreate(BaseModel):
    crop: str
    topic: str
    category: str = "Crop Health"
    content: str
    storage_advice: str
    common_diseases: List[str]
    pest_management: str
    verified_by: str = "ICAR Horticultural Directorate"
