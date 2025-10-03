import {BrowserRouter, Route, Routes} from "react-router-dom";
import './App.css'
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Login from "./pages/Login.tsx";
import ChatScreen from "./pages/ChatScreen.tsx";

function RouterWithTracking() {

    return (
        <Routes>

            <Route path="/" element={<Login/>}/>

            <Route element={<ProtectedRoute/>}>
                <Route path="/internal" element={<ChatScreen/>}/>
            </Route>

            <Route path="*" element={<NotFound/>}/>

        </Routes>
    );
}


function App() {
    return (
        <div className="mrava-use-case">
            <BrowserRouter basename="/">

                <RouterWithTracking/>

            </BrowserRouter>
        </div>
    );
}

export default App;
