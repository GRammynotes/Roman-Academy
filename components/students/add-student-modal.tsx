import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStudentModal({ onClose, onSuccess }: AddStudentModalProps) {
  const [fullName, setFullName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [stream, setStream] = useState("SCIENCE_PCM");
  const [classLevel, setClassLevel] = useState("TWELVE");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const batchMap: Record<string, Record<string, string>> = {
    SCIENCE_PCM: {
      ELEVEN: "11th Science 2026",
      TWELVE: "12th Science 2026",
    },
    COMMERCE_ADDON: {
      ELEVEN: "11th Commerce 2026",
      TWELVE: "12th Commerce 2026",
    },
    NEET_ADDON: {
      ELEVEN: "11th Science 2026",
      TWELVE: "12th Science 2026",
    }
  };

  const autoBatch = batchMap[stream]?.[classLevel] || "Unknown Batch";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          studentPhone,
          parentPhone,
          stream,
          classLevel,
          batchName: autoBatch
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add student");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-ivory-50 rounded-2xl shadow-xl overflow-hidden border border-gold-500/20">
        <div className="flex items-center justify-between p-4 border-b border-gold-500/10 bg-white">
          <h2 className="text-lg font-semibold text-navy-950">Add Student</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-ivory-100 text-navy-600 transition-colors">
            <X className="size-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-navy-950">Full Name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 rounded-lg border border-gold-500/30 bg-white px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              placeholder="Prachi Kamble"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">Student Phone</label>
              <input
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="w-full h-10 rounded-lg border border-gold-500/30 bg-white px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                placeholder="10 digits"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">Parent Phone</label>
              <input
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full h-10 rounded-lg border border-gold-500/30 bg-white px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                placeholder="10 digits"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">Stream</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full h-10 rounded-lg border border-gold-500/30 bg-white px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              >
                <option value="SCIENCE_PCM">Science PCM</option>
                <option value="COMMERCE_ADDON">Commerce</option>
                <option value="NEET_ADDON">NEET</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">Class</label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full h-10 rounded-lg border border-gold-500/30 bg-white px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              >
                <option value="ELEVEN">11th</option>
                <option value="TWELVE">12th</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-gold-400/10 rounded-lg border border-gold-500/20">
            <p className="text-xs text-navy-600 font-medium uppercase tracking-wider mb-1">Auto-assigned Batch</p>
            <p className="text-sm font-semibold text-navy-950">{autoBatch}</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Student"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
