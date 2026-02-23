import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect , useState } from 'react';
import { clearToken, getToken } from '../auth';
import api from '../api/axios';

type AuthUser = { userId: number , employee_name: string , roles: string[] ,createdAt: string , updatedAt: string }

export default function Layout() {

    const navigate = useNavigate();
    const { logout } = useAuth()

    const [me ,setMe] = useState<AuthUser | null>(null)
    const [name,setName] = useState('')

    function handleLogout(e?: React.MouseEvent) {
    e?.preventDefault();
    logout()
    navigate("/login", { replace: true });
     }

    useEffect(() => {
        // const token = getToken()
        // if(!token) return
        (async () => { 
            
            try{
                const { data } = await api.get("api/v1/auth/me")
                setMe(data)
                setName(data.employee_name)
            } catch {
            
            }  })()
    }, [])

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <nav className="print:hidden sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
              {/* <Link to="/lab_requests">Dashboard </Link> */}
              <div className='mx-auto max-w-7xl px-6 py-3 flex items-center gap-2'>
                <Link to="/lab_requests" className='px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 transition'>Lab_requests</Link>
                <Link to="/patients" className='px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 transition'>Patients</Link> 
                <Link to="/invList" className='px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 transition'>Investigations</Link>
                <Link to="/domains" className='px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 transition'>Domenii</Link> 
                <Link to="/machines" className='px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 transition'>Tipuri de aparate</Link>   
                <Link to="/" className='ml-auto px-3 py-2 rounded-xl text-sm font-semibold text-slate-100 hover:bg-slate-900/60 transition  '>{name}</Link> 
                <button type="button" onClick={handleLogout} className='px-3 py-2 rounded-xl text-sm font-medium border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition'>Logout</button>
              </div>
            </nav>
              <main className='mx-auto max-w-full px-6 py-6'>
                 <Outlet />
                </main>
            
        </div>
    )
}