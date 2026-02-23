import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Domains from "../pages/Domains";
import Investigations from "../pages/Investigations";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

import Layout from "../components/Layout"
import Lab_Requests from "../pages/Lab_Requests";
import Analyse from  "../pages/Analyse"
import Machines from "../pages/Machines";
import InvList from "../pages/InvList";
import Refs from "../pages/Refs";
import Medical_Report from "../pages/Medical_Report";

import Test from "../pages/Test";
import Patients from "../pages/Patients";
import Payments from "../pages/Payments";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/*Rutele externe*/}
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<Login />}/>
                    <Route path="/register" element={<Register />}/>
                </Route>

                {/*Rutele interne*/}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Navigate to="/lab_requests" replace /> } />
                        <Route path="lab_requests" element={<Lab_Requests />}/>
                        <Route path="analyse/:id" element={<Analyse />}/>
                        <Route path="analyse" element={<Analyse />}/>
                        <Route path="domains/:id" element={<Domains />}/>
                        <Route path="domains" element={<Domains />}/>
                        <Route path="invList" element={<InvList />}/>
                        <Route path="investigations/:id" element={<Investigations />}/>
                        <Route path="investigations" element={<Investigations />}/>
                        <Route path="machines/:id" element={<Machines />}/>
                        <Route path="machines" element={<Machines />}/>
                        <Route path="refs/:id" element={<Refs />}/>
                        <Route path="test" element={<Test />}/>
                        <Route path="test/:id" element={<Test />}/>
                        <Route path="patients/:id" element={<Patients />}/>
                        <Route path="patients" element={<Patients />}/>
                        <Route path="medical_report/:id" element={<Medical_Report />}/>
                        <Route path="payments/:id" element={<Payments />}/>
                        <Route path="payments" element={<Payments />}/>

                    </Route>
                </Route>

                {/*Rutele pagina inexistenta*/}
                <Route path="*" element={<div><h1>404- Pagina nu exista</h1></div>}/>

            </Routes>
        </BrowserRouter>
    )
}