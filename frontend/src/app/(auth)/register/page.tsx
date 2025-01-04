export default function RegisterPage() {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <section
          className="w-full max-w-lg p-6 rounded-md shadow-lg bg-card"
          aria-labelledby="register-title"
        >
          <h1
            id="register-title"
            className="text-2xl font-bold text-center mb-4 text-primary-foreground"
          >
            Create an Account
          </h1>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-secondary-foreground"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground p-2 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-secondary-foreground"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground p-2 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-secondary-foreground"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground p-2 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Enter your password"
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-secondary-foreground"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground p-2 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Confirm your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              Register
            </button>
          </form>
        </section>
      </main>
    );
  }