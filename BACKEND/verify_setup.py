"""
Quick verification script to check VoxAI backend setup
"""
import sys

print("=" * 60)
print("VoxAI Backend - Dependency Check")
print("=" * 60)
print()

# Check Python version
print(f"✓ Python version: {sys.version.split()[0]}")

# Check required packages
required_packages = [
    "fastapi",
    "uvicorn",
    "motor",
    "pymongo",
    "pydantic",
    "python-dotenv",
    "jose",
    "passlib",
    "webrtcvad",
    "faster_whisper",
    "groq",
    "requests",
    "fitz",  # PyMuPDF
    "sentence_transformers",
    "numpy",
    "pydub"
]

missing_packages = []
installed_packages = []

for package in required_packages:
    try:
        if package == "fitz":
            __import__("fitz")
        elif package == "jose":
            __import__("jose")
        else:
            __import__(package)
        installed_packages.append(package)
        print(f"✓ {package:25} - Installed")
    except ImportError:
        missing_packages.append(package)
        print(f"✗ {package:25} - MISSING")

print()
print("=" * 60)
print(f"Summary: {len(installed_packages)}/{len(required_packages)} packages installed")
print("=" * 60)

if missing_packages:
    print()
    print("⚠️  Missing packages detected!")
    print("Run: pip install -r requirements.txt")
    print()
    print("Missing:", ", ".join(missing_packages))
    sys.exit(1)
else:
    print()
    print("✅ All dependencies are installed!")
    print("You can now run: python main.py")
    print()
    
    # Check .env file
    import os
    if os.path.exists(".env"):
        print("✓ .env file found")
        from dotenv import load_dotenv
        load_dotenv()
        
        required_env = [
            "MONGODB_URI",
            "GROQ_API_KEY",
            "ELEVENLABS_API_KEY",
            "TAVILY_API_KEY",
            "JWT_SECRET_KEY"
        ]
        
        print()
        print("Environment Variables:")
        for env_var in required_env:
            value = os.getenv(env_var)
            if value:
                # Show only first 10 chars for security
                display = value[:10] + "..." if len(value) > 10 else value
                print(f"  ✓ {env_var:20} = {display}")
            else:
                print(f"  ✗ {env_var:20} = NOT SET")
    else:
        print("⚠️  .env file not found")
        print("   Copy .env.example to .env and configure your API keys")
    
    print()
    sys.exit(0)
