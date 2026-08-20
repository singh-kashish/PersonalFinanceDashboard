import { HeaderTitle } from "./HeaderTitle";
import OverallCardRow from "./OverallCardRow";

const Dashboard = () =>{
    return (
        <section className="p-8 flex flex-col justify-start gap-8">
            <HeaderTitle/>
            <OverallCardRow/>
        </section>
    );
}
export default Dashboard;