import Navbar from "../components/Navbar";

  export default function Home() {
    return (
      <div style={{ minWidth: "100%", backgroundColor: "#fff", margin: 0 }}>
        <Navbar />
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
          <h1 style={{ fontSize: "1.5rem", color: "#333" }}>Welcome to Mini-Market</h1>
        </main>
      </div>
    );
  }
