import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "./useAuth";

export const LoginPage = () => {
    const { login } = useAuth();

    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (passcode.trim() === "") {
            setError("Passcode is required.");
        }

        try {
            setError(null);
            setIsSubmitting(true);

            await login(passcode);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to login.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
                <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">

            <section className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl">

                <div className="mb-8">

                    <p className="text-sm font-medium text-slate-400">

                        Restaurant POS

                    </p>

                    <h1 className="mt-2 text-3xl font-bold">

                        Sign in

                    </h1>

                    <p className="mt-2 text-sm text-slate-400">

                        Enter your staff passcode to continue.

                    </p>

                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>

                        <label

                            htmlFor="passcode"

                            className="block text-sm font-medium text-slate-300"

                        >

                            Passcode

                        </label>

                        <input

                            id="passcode"

                            type="password"

                            inputMode="numeric"

                            value={passcode}

                            onChange={(event) => setPasscode(event.target.value)}

                            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"

                            placeholder="Enter passcode"

                        />

                    </div>

                    {error && (

                        <p className="rounded-lg border border-red-900/70 bg-red-950/50 px-4 py-3 text-sm text-red-200">

                            {error}

                        </p>

                    )}

                    <button

                        type="submit"

                        disabled={isSubmitting}

                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"

                    >

                        {isSubmitting ? "Signing in..." : "Sign in"}

                    </button>

                </form>

                <div className="mt-6 rounded-lg bg-slate-950 border border-slate-800 p-4 text-sm text-slate-400">

                    <p className="font-medium text-slate-300">Demo passcodes</p>

                    <p className="mt-2">Admin: 1111 • Manager: 2222 • Cashier: 3333</p>

                    <p>Kitchen: 4444 • Server: 5555 • Host: 6666</p>

                </div>

            </section>

        </main>
    );
};