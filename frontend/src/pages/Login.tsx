import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {ServiceRegistry} from "@/service/ServiceRegistry.ts";


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const is_logged_in = await ServiceRegistry.users.login_user(email, password);

        if (is_logged_in) {
            navigate("/internal");
        } else {
            alert("Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">Sign In</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label className="mb-1 text-gray-700 dark:text-gray-300 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-gray-700 dark:text-gray-300 font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
