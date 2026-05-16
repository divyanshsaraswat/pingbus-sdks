from setuptools import setup, find_packages

setup(
    name="pingbus",
    version="0.8.0",
    author="PingBus Team",
    author_email="pingbusofficial@gmail.com",
    description="Official Python SDK for PingBus Notification Gateway",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/divyanshsaraswat/pingbus-sdks",
    project_urls={
        "Bug Tracker": "https://github.com/divyanshsaraswat/pingbus-sdks/issues",
        "Source Code": "https://github.com/divyanshsaraswat/pingbus-sdks",
        "Documentation": "https://pingbus.com/docs",
    },
    packages=find_packages(),
    install_requires=[
        "httpx>=0.24.0",
        "pydantic>=2.0.0",
    ],
    extras_require={
        "test": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "respx>=0.20.0"
        ],
    },
    keywords=["pingbus", "notifications", "whatsapp", "email", "sms", "push", "fcm", "twilio", "webhook"],
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Communications :: Chat",
    ],
    python_requires='>=3.8',
)
