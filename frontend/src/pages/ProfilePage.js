import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Heart, Shield, Save, Plus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const Section = ({ title, icon: Icon, color = "var(--accent-cyan)", children }) => (
  <div className="glass-card" style={{ padding: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <Icon size={18} color={color} />
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{title}</h3>
    </div>
    {children}
  </div>
);

const TagInput = ({ values = [], onChange, placeholder }) => {
  const [input, setInput] = useState("");
  const add = () => {
    if (input.trim() && !values.includes(input.trim())) {
      onChange([...values, input.trim()]);
      setInput("");
    }
  };
  const remove = (v) => onChange(values.filter((x) => x !== v));
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {values.map((v) => (
          <span key={v} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: "var(--radius-sm)",
            background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)",
            fontSize: 12, color: "var(--text-primary)",
          }}>
            {v}
            <button onClick={() => remove(v)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()} placeholder={placeholder}
          style={{ padding: "8px 12px" }} />
        <button onClick={add} className="btn btn-ghost" style={{ padding: "8px 12px" }}>
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const isDoctor = user?.role === "doctor";

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    age: user?.age || "",
    gender: user?.gender || "",
    bloodGroup: user?.bloodGroup || "",
    address: user?.address || {},
    emergencyContact: user?.emergencyContact || { name: "", phone: "", relation: "" },
    medicalHistory: user?.medicalHistory || { allergies: [], chronicConditions: [], currentMedications: [] },
    doctorInfo: user?.doctorInfo || { specialization: "", hospital: "", experience: "" },
    preferredLanguage: user?.preferredLanguage || "en",
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setNested = (parent, key) => (e) => setForm((p) => ({ ...p, [parent]: { ...p[parent], [key]: e.target.value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/profile", form);
      updateUser(res.data.user);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          {isDoctor ? "Professional Profile" : "Health Profile"}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {isDoctor ? "Manage your professional details and availability" : "Keep your profile updated for more accurate AI analysis"}
        </p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Basic Info */}
        <Section title="Basic Information" icon={User}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Full Name</label>
              <input className="input" value={form.name} onChange={set("name")} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Phone</label>
              <input className="input" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Age</label>
                <input className="input" type="number" value={form.age} onChange={set("age")} placeholder="Age" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Gender</label>
                <select className="input" value={form.gender} onChange={set("gender")}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
            
            {!isDoctor && (
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Blood Group</label>
                <select className="input" value={form.bloodGroup} onChange={set("bloodGroup")}>
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            )}
            
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Language</label>
              <select className="input" value={form.preferredLanguage} onChange={set("preferredLanguage")}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="hinglish">Hinglish</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="mr">Marathi</option>
              </select>
            </div>
          </div>
        </Section>

        {isDoctor ? (
          /* Professional Info for Doctors */
          <Section title="Professional Information" icon={Shield} color="var(--accent-cyan)">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Specialization</label>
                  <input className="input" value={form.doctorInfo.specialization} onChange={setNested("doctorInfo", "specialization")} placeholder="e.g. Cardiologist" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Degree / Type</label>
                  <input className="input" value={form.doctorInfo.degree || ""} onChange={setNested("doctorInfo", "degree")} placeholder="e.g. MD, MBBS" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Experience (Years)</label>
                  <input className="input" type="number" value={form.doctorInfo.experience} onChange={setNested("doctorInfo", "experience")} placeholder="e.g. 10" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Hospital / Clinic Name</label>
                <input className="input" value={form.doctorInfo.hospital} onChange={setNested("doctorInfo", "hospital")} placeholder="e.g. Apollo Hospital" />
              </div>
            </div>
          </Section>
        ) : (
          <>
            {/* Emergency Contact */}
            <Section title="Emergency Contact" icon={Phone} color="var(--accent-red)">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                {[["name","Contact Name"],["phone","Phone Number"],["relation","Relation"]].map(([key, label]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{label}</label>
                    <input className="input" value={form.emergencyContact[key] || ""} onChange={setNested("emergencyContact", key)} placeholder={label} />
                  </div>
                ))}
              </div>
            </Section>

            {/* Medical History */}
            <Section title="Medical History" icon={Heart} color="var(--accent-green)">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { key: "allergies", label: "Allergies", placeholder: "e.g. Penicillin, Peanuts" },
                  { key: "chronicConditions", label: "Chronic Conditions", placeholder: "e.g. Diabetes, Hypertension" },
                  { key: "currentMedications", label: "Current Medications", placeholder: "e.g. Metformin 500mg" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
                    <TagInput
                      values={form.medicalHistory[key] || []}
                      onChange={(v) => setForm((p) => ({ ...p, medicalHistory: { ...p.medicalHistory, [key]: v } }))}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Save */}
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: "13px", fontSize: 15 }}>
          {saving ? <><div className="spinner" style={{ width: 18, height: 18 }} />Saving...</> : <><Save size={18} />Save Profile</>}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
