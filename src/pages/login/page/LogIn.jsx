
import { useLogIn } from '../hook/useLogIn';

const Login = () => {
  const { username, setUsername, password, setPassword, handleLogin } = useLogIn();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#1e2f4f] via-[#2a4470] to-[#1e2f4f]">
      <form
        onSubmit={handleLogin}
        className="bg-[#eee] border-2 border-[#1e2f4f] px-8 pt-4 pb-8 rounded shadow-md w-110 h-80 rounded-[15px]"
      >
        <div className="text-center">
          <h2 className="font-bold text-[30px] text-[#044b4b] tracking-wide text-shadow-lg">
            Presenza
          </h2>
          <h3 className=" font-bold text-[16px] text-[#3a8686]">Admin Login</h3>
        </div>
        <div className="justify-self-center py-8 w-full">
          <div className="w-full mb-4">
            <input
              className="border border-gray-500 w-full rounded-[20px] py-2 px-4 outline-none"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="w-full mb-8">
            <input
              className="border border-gray-500 w-full rounded-[20px] py-2 px-4 outline-none"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-center bg-gray-600 w-full py-2 rounded-[20px] transform transition-bg duration-300 hover:bg-[#2a4470]">
            <button type="submit" className="text-white font-bold tracking-wide text-lg cursor-pointer w-full">
              Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
