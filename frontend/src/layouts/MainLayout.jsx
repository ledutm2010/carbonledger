import Navbar
from "../components/Navbar";

export default function MainLayout({
    children
}) {

    return (

        <div
            className="
            min-h-screen
            bg-green-950
            text-white
        "
        >

            <Navbar />

            <div className="p-8">
                {children}
            </div>

        </div>
    );
}