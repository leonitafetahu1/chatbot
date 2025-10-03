FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/api

RUN pip install uv

COPY requirements.txt .
RUN uv pip install --system --no-cache-dir --upgrade -r requirements.txt

COPY . ./api

EXPOSE 9090

CMD ["uvicorn", "api.src.main:app", "--host", "0.0.0.0", "--port", "9090", "--workers", "1", "--loop", "uvloop", "--reload"]