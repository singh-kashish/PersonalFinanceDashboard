type MainCompTypes = {
    id: string
}
const Main = ({id}:MainCompTypes) =>{
    return (
        <main id={id} className="border-l">Main</main>
    )
}
export default Main