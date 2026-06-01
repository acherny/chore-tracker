# Frontend is pre-built (frontend/dist/) — no Node needed at install time.
# This keeps Pi install time under 2 minutes instead of 15+.
FROM python:3.11-slim
WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY frontend/dist/ ./static/

RUN mkdir -p /data

EXPOSE 8099
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8099"]
