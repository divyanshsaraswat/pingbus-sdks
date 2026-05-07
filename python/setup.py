from setuptools import setup, find_packages

setup(
    name="pingbus-python",
    version="1.0.0",
    author="Divyansh Saraswat",
    description="Official Python SDK for PingBus Notification Gateway",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/divyanshsaraswat/pingbus-sdks",
    packages=find_packages(),
    install_requires=[
        "httpx>=0.24.0",
        "pydantic>=2.0.0",
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.8',
)
