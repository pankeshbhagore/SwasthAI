import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Clipboard, Check, X, MessageSquare, Phone, Video, Search } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import ChatInterface from "../Communication/ChatInterface";
import PatientHistoryModal from "./PatientHistoryModal";
import { AnimatePresence } from "framer-motion";

const DoctorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeComm, setActiveComm] = useState(null);
  const [viewHistoryPatient, setViewHistoryPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorInfo?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, patRes] = await Promise.all([
        api.get("/doctors/requests"),
        api.get("/doctors/my-patients")
      ]);
      setRequests(reqRes.data.data.filter(r => r.status === "pending"));
      setPatients(patRes.data.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      await api.post("/doctors/respond", { requestId, status });
      toast.success(`Request ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to respond to request");
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Requests Section */}
      {requests.length > 0 && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>Pending Requests</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.map(req => (
              <div key={req._id} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{req.patient.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{req.patient.age}y, {req.patient.gender}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleRespond(req._id, "accepted")} className="btn" style={{ padding: "8px 12px", background: "rgba(0,255,136,0.1)", color: "var(--accent-green)" }}>
                    <Check size={16} /> Accept
                  </button>
                  <button onClick={() => handleRespond(req._id, "rejected")} className="btn" style={{ padding: "8px 12px", background: "rgba(255,61,113,0.1)", color: "var(--accent-red)" }}>
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Patients Section */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>My Patients</h3>
          <div style={{ position: "relative", width: 250 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              className="input" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 40, height: 40, fontSize: 13 }} 
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filteredPatients.length > 0 ? filteredPatients.map(patient => (
            <div key={patient._id} className="glass-card" style={{ padding: 16, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{patient.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{patient.age}y • {patient.bloodGroup || "O+"} • {patient.gender}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                <button onClick={() => setActiveComm({ user: patient, type: "chat" })} className="btn btn-ghost" style={{ fontSize: 11, padding: "8px 0" }}>
                  <MessageSquare size={14} /> Chat
                </button>
                <button onClick={() => setActiveComm({ user: patient, type: "call" })} className="btn btn-ghost" style={{ fontSize: 11, padding: "8px 0" }}>
                  <Phone size={14} /> Call
                </button>
                <button onClick={() => setActiveComm({ user: patient, type: "video" })} className="btn btn-ghost" style={{ fontSize: 11, padding: "8px 0" }}>
                  <Video size={14} /> Video
                </button>
              </div>
              
              <button onClick={() => setViewHistoryPatient(patient)} className="btn btn-primary" style={{ width: "100%", marginTop: 12, height: 36, fontSize: 12 }}>
                <Clipboard size={14} /> View Health History
              </button>
            </div>
          )) : (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              No patients yet. When you accept requests, they will appear here.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {activeComm && (
          <ChatInterface 
            otherUser={activeComm.user} 
            type={activeComm.type} 
            onClose={() => setActiveComm(null)} 
          />
        )}
        {viewHistoryPatient && (
          <PatientHistoryModal 
            patient={viewHistoryPatient} 
            onClose={() => setViewHistoryPatient(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorDashboard;
