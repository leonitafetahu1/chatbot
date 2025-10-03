import asyncio
import math
import random
from fastapi import APIRouter, Request, Query
from starlette.responses import StreamingResponse

router_http = APIRouter()

# Global state
PARA_POS = {"alice": 0, "matrix": 0}
MATRIX_COUNT = 0  # Tracks which matrix file to use next

# Load Alice paragraphs
def load_file(file_path):
    with open(file_path, "r") as f:
        paragraphs = f.read().split("\n\n")
    return [p.strip() for p in paragraphs if p.strip() and "*" not in p]

ALICE_PARAGRAPHS = load_file("/api/uploads/alice.txt")

# Load Matrix files
def load_matrix_file(n):
    try:
        return load_file(f"/api/uploads/matrix{n}.txt")
    except FileNotFoundError:
        return []

MIN_DELAY = 0.01
MAX_DELAY = 0.1

def get_normalized_delay(paragraph, min_len, max_len):
    para_len = len(paragraph)
    if max_len != min_len:
        norm_len = (para_len - min_len) / (max_len - min_len)
    else:
        norm_len = 0.5
    base_delay = 0.02 + norm_len * 0.9
    delay = random.lognormvariate(mu=math.log(base_delay), sigma=0.3)
    return max(MIN_DELAY, min(delay, MAX_DELAY))


@router_http.get("/talk", response_class=StreamingResponse)
async def talk(request: Request, prompt: str = Query("")):
    async def event_stream():
        global PARA_POS, MATRIX_COUNT
        i = 0

        if any(word in prompt.lower() for word in ["matrix", "morpheus"]) and MATRIX_COUNT <= 4:
            MATRIX_COUNT += 1

            if MATRIX_COUNT > 0:
                paragraphs = load_matrix_file(MATRIX_COUNT)
                idx_key = f"matrix{MATRIX_COUNT}"
                if idx_key not in PARA_POS:
                    PARA_POS[idx_key] = 0
                use_matrix = True
            else:
                # Revert to Alice
                paragraphs = ALICE_PARAGRAPHS
                idx_key = "alice"
                use_matrix = False
        else:
            paragraphs = ALICE_PARAGRAPHS
            idx_key = "alice"
            use_matrix = False

        min_len, max_len = min(len(p) for p in paragraphs), max(len(p) for p in paragraphs)
        idx = PARA_POS[idx_key]

        while True:
            if i > 20:
                break

            if use_matrix and idx >= len(paragraphs):
                break

            if not use_matrix and idx >= len(paragraphs):
                idx = 0

            paragraph = paragraphs[idx]
            yield f"data: {paragraph}\n\n"

            PARA_POS[idx_key] = idx + 1
            idx += 1
            i += 1

            if await request.is_disconnected():
                print("[talk] Client disconnected")
                break

            delay = get_normalized_delay(paragraph, min_len, max_len)
            await asyncio.sleep(delay)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
