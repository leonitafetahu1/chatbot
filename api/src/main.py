from fastapi import APIRouter, FastAPI
from fastapi.responses import ORJSONResponse
from starlette.middleware.cors import CORSMiddleware

from api.src.routes.agent import router_http as agent_router_http
from api.src.utils.lifespan import lifespan


def setup_routes(app: FastAPI) -> None:
    """Setup all application routes"""
    router_v1 = APIRouter()

    # Include all sub-routers
    router_v1.include_router(agent_router_http, prefix="/agent", tags=["app"])

    # Include the main router
    app.include_router(router_v1, prefix="/v1")


# In your main.py
def create_app() -> FastAPI:
    app = FastAPI(
        title="Mrava UG | Challenge",
        description="Mrava Fullstack - Keycloak challenge",
        version="0.0.1",
        redirect_slashes=True,
        root_path="/",
        default_response_class=ORJSONResponse,
        lifespan=lifespan
    )

    # Register your custom docs endpoint
    setup_routes(app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "*",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=[
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
        ],
    )

    return app


app = create_app()
