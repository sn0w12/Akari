import { Metadata } from "next";
import { robots } from "@/lib/utils";
import Register from "@/components/register";

export const metadata: Metadata = {
    title: "Register",
    description: "Register an account on Akari",
    robots: robots(),
};

export default function RegisterPage() {
    return (
        <div className="bg-background text-foreground">
            <Register />
        </div>
    );
}
