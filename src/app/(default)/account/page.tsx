import AccountClient from "@/components/account";

export default async function AccountPage() {
    return (
        <div className="mx-auto px-4 py-1 max-w-6xl flex-grow">
            <h1 className="text-3xl font-bold pb-2">Account</h1>
            <AccountClient />
        </div>
    );
}
