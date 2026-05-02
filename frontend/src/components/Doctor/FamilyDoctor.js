import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, MessageCircle, Phone, Video, ShieldCheck, Stethoscope } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import ChatInterface from "../Communication/ChatInterface";
import { AnimatePresence } from "framer-motion";

const FamilyDoctor = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myDoctor, setMyDoctor] = useState(null);
  const [activeComm, setActiveComm] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get("/doctors/status");
      setRequests(res.data.data.requests || []);
      if (res.data.data.familyDoctor) {
        setMyDoctor(res.data.data.familyDoctor);
      }
    } catch (err) {
      console.error("Failed to fetch doctor status");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/doctors/search?query=${search}`);
      setDoctors(res.data.data);
      if (res.data.data.length === 0) toast("No doctors found with that name/specialty");
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (doctorId) => {
    try {
      await api.post("/doctors/request", { doctorId, message: "I would like you to be my family doctor." });
      toast.success("Request sent successfully!");
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const getRequestStatus = (doctorId) => {
    const req = requests.find(r => r.doctor._id === doctorId || r.doctor === doctorId);
    return req ? req.status : null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Search Header */}
      <div className="glass-card" style={{ padding: 32, textAlign: "center", background: "linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(0,255,136,0.05) 100%)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 12 }}>Your Family Doctor</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 500, margin: "0 auto 24px" }}>
          Connect with a trusted medical professional for personalized care, prescriptions, and 24/7 support.
        </p>

        <form onSubmit={handleSearch} style={{ maxWidth: 500, margin: "0 auto", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            className="input" 
            placeholder="Search by doctor name or specialization..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 48, height: 50, fontSize: 14 }}
          />
          <button type="submit" className="btn btn-primary" style={{ position: "absolute", right: 6, top: 6, bottom: 6, padding: "0 20px", height: "auto" }}>
            Search
          </button>
        </form>
      </div>

      {/* Current Doctor / Status */}
      {myDoctor ? (
        <div className="glass-card" style={{ padding: 24, border: "1px solid var(--accent-green)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--accent-green)" }}>
                <Stethoscope size={32} color="var(--accent-green)" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 20 }}>Dr. {myDoctor.name}</h3>
                  <ShieldCheck size={18} color="var(--accent-cyan)" />
                </div>
                <div style={{ color: "var(--accent-cyan)", fontWeight: 600, fontSize: 13 }}>{myDoctor.doctorInfo?.specialization}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{myDoctor.doctorInfo?.hospital || "MediMind Verified Partner"}</div>
              </div>
            </div>
            <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(0,255,136,0.1)", color: "var(--accent-green)", fontSize: 11, fontWeight: 700 }}>ACTIVE CONNECTION</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <button onClick={() => setActiveComm({ user: myDoctor, type: "chat" })} className="btn" style={{ background: "rgba(0,229,255,0.1)", color: "var(--accent-cyan)", height: 45 }}>
              <MessageCircle size={18} /> Instant Chat
            </button>
            <button onClick={() => setActiveComm({ user: myDoctor, type: "call" })} className="btn" style={{ background: "rgba(167,139,250,0.1)", color: "var(--accent-purple)", height: 45 }}>
              <Phone size={18} /> Voice Call
            </button>
            <button onClick={() => setActiveComm({ user: myDoctor, type: "video" })} className="btn" style={{ background: "rgba(255,179,0,0.1)", color: "var(--accent-amber)", height: 45 }}>
              <Video size={18} /> Video Consultation
            </button>
          </div>
        </div>
      ) : requests.some(r => r.status === "pending") && (
        <div className="glass-card" style={{ padding: 20, textAlign: "center", border: "1px solid var(--accent-amber)" }}>
           <div style={{ color: "var(--accent-amber)", fontWeight: 600 }}>Request Pending</div>
           <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>Waiting for Dr. {requests.find(r => r.status === "pending").doctor.name} to accept.</p>
        </div>
      )}

      {/* Search Results */}
      {doctors.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {doctors.map(doc => {
            const status = getRequestStatus(doc._id);
            return (
              <div key={doc._id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                   <div style={{ width: 50, height: 50, borderRadius: 12, background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserPlus size={24} color="var(--text-muted)" />
                   </div>
                   <div>
                      <div style={{ fontWeight: 700 }}>Dr. {doc.name}</div>
                      <div style={{ fontSize: 12, color: "var(--accent-cyan)" }}>{doc.doctorInfo?.specialization}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{doc.doctorInfo?.experience || "5+"} years experience</div>
                   </div>
                </div>
                
                {myDoctor?._id === doc._id ? (
                  <div style={{ padding: "8px", borderRadius: 8, background: "rgba(0,255,136,0.1)", color: "var(--accent-green)", textAlign: "center", fontSize: 12, fontWeight: 700 }}>
                    YOUR FAMILY DOCTOR
                  </div>
                ) : status === "pending" ? (
                  <button className="btn" disabled style={{ width: "100%", opacity: 0.6 }}>Request Sent</button>
                ) : (
                  <button onClick={() => sendRequest(doc._id)} className="btn btn-primary" style={{ width: "100%" }}>
                    <UserPlus size={16} /> Request Connection
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {activeComm && (
          <ChatInterface 
            otherUser={activeComm.user} 
            type={activeComm.type} 
            onClose={() => setActiveComm(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FamilyDoctor;
