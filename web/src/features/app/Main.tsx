import { Outlet } from "@tanstack/react-router"

type MainCompTypes = {
    id: string
}
const Main = ({id}:MainCompTypes) =>{
    return (
        <main id={id} className="">
            <Outlet/>
        </main>
    )
}
export default Main