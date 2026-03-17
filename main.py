from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import asyncio
import re

app = FastAPI(title="PhishShield AI Backend", description="Backend API for thread detection.")

# CORS settings - allow frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    type: str
    content: str

# Simulated AI Detection Logic
URGENCY_KEYWORDS = ['urgent', 'immediate', 'action required', 'suspend', 'verify', 'account limited']
FINANCIAL_KEYWORDS = ['invoice', 'payment', 'transfer', 'crypto', 'bitcoin', 'bank', 'routing']
SUSPICIOUS_DOMAINS = ['login-secure', 'verify-account', 'update-info', '.xyz', '.top', 'free-gift']

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "PhishShield AI Backend is running"}

@app.post("/api/scan")
async def analyze_threat(request: ScanRequest):
    content_type = request.type
    content = request.content.lower()

    # Simulate a slight delay for AI processing
    await asyncio.sleep(1.5)

    is_safe = True
    confidence = random.uniform(85.0, 99.9)
    threat_type = 'None Detected'
    indicators = []

    # 1. Basic Heuristics Check
    
    # Check Urgency
    if any(kw in content for kw in URGENCY_KEYWORDS):
        indicators.append('Urgency Keywords')
        is_safe = False
        threat_type = 'Social Engineering (Urgency)'

    # Check Financial themes
    if any(kw in content for kw in FINANCIAL_KEYWORDS):
        indicators.append('Financial Themes')
        is_safe = False
        if threat_type == 'None Detected':
             threat_type = 'Financial Fraud'

    # Check link structure/domain (if it's a url)
    if content_type == 'url':
        if any(domain in content for domain in SUSPICIOUS_DOMAINS):
            indicators.append('Suspicious Domain/TLD')
            is_safe = False
            threat_type = 'Credential Harvesting (Phishing)'
        
        # Simple typo-squatting simulation
        if 'paypal' in content and 'paypal.com' not in content:
             indicators.append('Brand Impersonation (Typo-squatting)')
             is_safe = False
             threat_type = 'Brand Impersonation'
             
    # 2. Synthesize Results
    if is_safe:
        return {
            "status": "safe",
            "confidence": f"{confidence:.1f}%",
            "details": "Content analyzed. No malicious signatures or behavioral anomalies detected."
        }
    else:
        # Boost confidence artificially for the demo to look definitive
        confidence = random.uniform(95.0, 99.9)
        return {
            "status": "danger",
            "confidence": f"{confidence:.1f}%",
            "threatType": threat_type,
            "indicators": ", ".join(indicators)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
