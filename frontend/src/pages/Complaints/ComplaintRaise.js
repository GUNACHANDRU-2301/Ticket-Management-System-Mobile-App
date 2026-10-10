import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  AlertCircle,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const COMPLAINT_CATEGORIES = [
  { value: 'Electrician', label: '⚡ Electrical / Electrician', desc: 'Power failure, switches, lighting, wiring' },
  { value: 'Plumber', label: '🚰 Plumbing & Water', desc: 'Pipe leaks, taps, drainage, bathroom fixtures' },
  { value: 'Carpenter', label: '🪚 Carpentry & Furniture', desc: 'Doors, windows, desks, locks, wooden fixtures' },
  { value: 'IT Support', label: '💻 IT Support & Network', desc: 'LAN, Wi-Fi, PC hardware, projectors, software' },
  { value: 'AC Technician', label: '❄️ AC & Air Conditioning', desc: 'Cooling issues, noise, thermostat control' },
  { value: 'Cleaning', label: '🧹 Housekeeping & Cleaning', desc: 'Sanitation, waste removal, deep cleaning' },
  { value: 'General', label: '🔧 General Maintenance', desc: 'Wall repair, paint, general facility requests' }
];

const ComplaintRaise = () => {
  const navigate = useNavigate();

  // Multi-step State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState('');

  // Master Data
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Form State
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedProg, setSelectedProg] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [title, setTitle] = useState('');
  const [remarks, setRemarks] = useState('');
  const [priority, setPriority] = useState('Medium');

  // File Upload State
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [deptRes, progRes, blockRes, roomRes] = await Promise.all([
          axios.get(`${API_URL}/masters/departments`),
          axios.get(`${API_URL}/masters/programmes`),
          axios.get(`${API_URL}/masters/blocks`),
          axios.get(`${API_URL}/masters/rooms`)
        ]);
        setDepartments(deptRes.data || []);
        setProgrammes(progRes.data || []);
        setBlocks(blockRes.data || []);
        setRooms(roomRes.data || []);
      } catch (err) {
        console.error('Error fetching location masters:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchMasters();
  }, []);

  // Filtered location data
  const filteredProgrammes = programmes.filter((p) => {
    const dId = p.departmentId?._id || p.departmentId;
    return !selectedDept || dId === selectedDept;
  });

  const filteredBlocks = blocks.filter((b) => {
    const dId = b.departmentId?._id || b.departmentId;
    const pId = b.programmeId?._id || b.programmeId;
    return (!selectedDept || dId === selectedDept) && (!selectedProg || pId === selectedProg);
  });

  const filteredRooms = rooms.filter((r) => {
    const bId = r.blockId?._id || r.blockId;
    return !selectedBlock || bId === selectedBlock;
  });

  // Handle File Drag & Drop / Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1 && (!selectedBlock || !selectedRoom)) {
      setErrorMessage('Please select both Block and Room Number.');
      return;
    }
    if (currentStep === 2 && (!complaintType || !remarks.trim())) {
      setErrorMessage('Please select a Category and provide detailed remarks.');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const blockObj = blocks.find((b) => b._id === selectedBlock);
    const roomObj = rooms.find((r) => r._id === selectedRoom);
    const deptObj = departments.find((d) => d._id === selectedDept);

    const blockName = blockObj ? blockObj.name : selectedBlock;
    const roomNumber = roomObj ? roomObj.roomNumber : selectedRoom;
    const departmentName = deptObj ? deptObj.name : '';

    try {
      const formData = new FormData();
      formData.append('blockName', blockName);
      formData.append('roomNumber', roomNumber);
      formData.append('complaintType', complaintType);
      formData.append('remarks', remarks);
      formData.append('department', departmentName);
      formData.append('priority', priority);

      if (file) {
        formData.append('attachment', file);
      }

      const res = await axios.post(`${API_URL}/complaints/raise`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newId = res.data.complaint?._id || 'TMS-000123';
      setSubmittedTicketId(`#TMS-${newId.substring(newId.length - 6).toUpperCase()}`);
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit complaint. Check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 32px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--status-resolved-bg)', color: 'var(--status-resolved-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <CheckCircle2 size={44} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Complaint Submitted Successfully! 🎉
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Your ticket ID is <strong style={{ color: 'var(--primary)' }}>{submittedTicketId}</strong>. Our facility staff will attend to it shortly.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/complaints/my')}>
              Track in My Complaints
            </button>
            <button className="btn btn-primary" onClick={() => { setIsSuccess(false); setCurrentStep(1); setRemarks(''); setFile(null); setFilePreview(null); }}>
              Raise Another Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          Raise Maintenance Complaint
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Follow the 4-step wizard to report a campus facility issue
        </p>
      </div>

      {/* STEP PROGRESS BAR */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <StepBadge step={1} currentStep={currentStep} label="Location" />
          <StepBadge step={2} currentStep={currentStep} label="Issue Details" />
          <StepBadge step={3} currentStep={currentStep} label="Evidence Upload" />
          <StepBadge step={4} currentStep={currentStep} label="Review & Submit" />
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div style={{ backgroundColor: 'var(--status-hold-bg)', color: 'var(--status-hold-text)', border: '1px solid var(--status-hold-border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* STEP 1: LOCATION HIERARCHY */}
      {currentStep === 1 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MapPin size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>Step 1: Location Hierarchy</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-control" value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedProg(''); setSelectedBlock(''); setSelectedRoom(''); }}>
                <option value="">Select Department (Optional)</option>
                {departments.map((d) => (<option key={d._id} value={d._id}>{d.name} ({d.shortName})</option>))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Programme</label>
              <select className="form-control" value={selectedProg} onChange={(e) => { setSelectedProg(e.target.value); setSelectedBlock(''); setSelectedRoom(''); }}>
                <option value="">Select Programme (Optional)</option>
                {filteredProgrammes.map((p) => (<option key={p._id} value={p._id}>{p.name} ({p.shortName})</option>))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Block Name *</label>
              <select className="form-control" value={selectedBlock} onChange={(e) => { setSelectedBlock(e.target.value); setSelectedRoom(''); }}>
                <option value="">Select Building Block</option>
                {filteredBlocks.map((b) => (<option key={b._id} value={b._id}>{b.name}</option>))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <select className="form-control" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                <option value="">Select Room Number</option>
                {filteredRooms.map((r) => (<option key={r._id} value={r._id}>Room {r.roomNumber}</option>))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={handleNextStep}>
              Next: Issue Details <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ISSUE DETAILS & PRIORITY */}
      {currentStep === 2 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>Step 2: Issue Specification</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Service Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  onClick={() => setComplaintType(cat.value)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: complaintType === cat.value ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: complaintType === cat.value ? 'var(--primary-light)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{cat.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{cat.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ticket Priority</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: priority === p ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: priority === p ? 'var(--primary-light)' : 'var(--bg-surface)',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: priority === p ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks & Problem Description *</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe the problem in detail (e.g. Broken light switch on north wall)..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn btn-secondary" onClick={handlePrevStep}>
              <ArrowLeft size={16} /> Previous
            </button>
            <button className="btn btn-primary" onClick={handleNextStep}>
              Next: Evidence Upload <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EVIDENCE ATTACHMENT */}
      {currentStep === 3 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ImageIcon size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>Step 3: Attach Photo Evidence</h3>
          </div>

          {!filePreview ? (
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-body)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <Upload size={36} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                Click or Drag & Drop photo here
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Supports PNG, JPG, JPEG (Max 5MB)
              </div>
              <input
                id="file-upload-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <img src={filePreview} alt="Preview" style={{ maxHeight: '240px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
              <div style={{ marginTop: '12px' }}>
                <button className="btn btn-secondary" onClick={removeFile} style={{ color: '#EF4444' }}>
                  <X size={16} /> Remove Photo
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn btn-secondary" onClick={handlePrevStep}>
              <ArrowLeft size={16} /> Previous
            </button>
            <button className="btn btn-primary" onClick={handleNextStep}>
              Next: Review & Submit <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {currentStep === 4 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>Step 4: Final Ticket Review</h3>
          </div>

          <div style={{ backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>LOCATION</div>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                  Block {blocks.find(b => b._id === selectedBlock)?.name || selectedBlock}, Room {rooms.find(r => r._id === selectedRoom)?.roomNumber || selectedRoom}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>CATEGORY & PRIORITY</div>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                  {complaintType} • <span style={{ color: 'var(--primary)' }}>{priority} Priority</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>REMARKS</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{remarks}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={handlePrevStep}>
              <ArrowLeft size={16} /> Previous
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting Ticket...' : 'Confirm & Submit Complaint'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StepBadge = ({ step, currentStep, label }) => {
  const isDone = currentStep > step;
  const isCurrent = currentStep === step;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: isDone ? 'var(--status-resolved-bg)' : isCurrent ? 'var(--primary)' : 'var(--bg-body)',
          color: isDone ? 'var(--status-resolved-text)' : isCurrent ? '#FFFFFF' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          border: isCurrent ? 'none' : '1px solid var(--border-color)'
        }}
      >
        {isDone ? '✓' : step}
      </div>
      <span style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );
};

export default ComplaintRaise;
