import { useState, useRef } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from "../components/sidebar";
import weddingerLogo from "../assets/logo.png";
import { FileText, Upload, HardDrive, Clock, Dot, Download, Delete, Trash } from "lucide-react";
import DocumentBlock from "../components/documentBlock";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../components/deleteModal";

const Documents = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const { data: documentResponse } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            const response = await fetch("/api/documents", {credentials: "include"});
            if (!response.ok) {throw new Error("Greška prilikom dohvaćanja dokumenata");}
            return response.json();
        },
        staleTime: 3000, // Podaci su "svježi" 3 sekundi - neće ih ponovo tražiti dokle god su svježi
        refetchInterval: 10000, // Zadržavamo tvoj interval od 10s u pozadini
    });

    const total_documents = documentResponse?.total_documents ?? 0;
    const total_size = documentResponse?.total_size ?? 0;
    const last_uploaded = documentResponse?.last_uploaded ? new Date(documentResponse.last_uploaded).toLocaleDateString() : "Nema";

    const uploadFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        console.log("0dabrana datoteka:", file.name, file.size, file.type);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (response.ok) {
                console.log("Datoteka uspješno uplodana")
                queryClient.invalidateQueries(['documents']); // Osvježava podatke o dokumentima nakon uploada
            } else {
                console.error("Grešak prilikom uploada")
            }
        } catch (error) {
            console.error("Greška prilikom uploada:", error);
        }
    };

    const deleteFile = async (fileId) => {
        try {
            const response = await fetch(`/api/documents/${fileId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                console.log("Datoteka uspješno obrisana")
                queryClient.invalidateQueries(['documents']); // Osvježava podatke o dokumentima nakon brisanja
            } else {
                console.error("Grešak prilikom brisanja")
            }
        } catch (error) {
            console.error("Greška prilikom brisanja:", error);
        }
    };

    const downloadFile = async (fileId) => {
        try {
            const response = await fetch(`/api/documents/${fileId}/download`, {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const disposition = response.headers.get('Content-Disposition');
                let filename = 'document';
                const match = disposition?.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
                if (match && match[1]) {
                    filename = decodeURIComponent(match[1]);
                }

                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                console.error("Greška prilikom preuzimanja");
            }
        } catch (error) {
            console.error("Greška prilikom preuzimanja:", error);
        }
    };

    const getFileColor = (mime) => {
        if (mime === "application/pdf") return "bg-red-50 text-red-500";
        return "bg-blue-50 text-blue-500";
    }

    const formatBytes = (bytes) => {
        if (!bytes) return "0 KB";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    return (
        <div className="h-dvh w-screen flex overflow-hidden bg-[#fcfbfa] relative">
            <input type="file" ref={fileInputRef} onChange={uploadFile} accept=".pdf,.doc,.docx" className="hidden" />
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <div className={`fixed inset-y-0 left-0 w-64 bg-white flex flex-col p-6 shadow-xl h-full border-r border-gray-100 z-40 lg:z-10 lg:static transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div onClick={() => navigate("/dashboard")} className="cursor-pointer flex items-center justify-between lg:justify-center">
                    <img src={weddingerLogo} alt="Weddinger Logo" className="h-auto w-36 lg:w-44" />
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <Sidebar activeTab="Dokumenti" />
            </div>

            <div className="flex flex-1 h-dvh bg-[#fcfbfa] overflow-auto">
                <div className="flex flex-col w-full h-full relative pb-28 lg:pb-10">
                    <div className="flex px-4 md:px-10 lg:px-16 pt-6 lg:pt-12 pb-4 items-center justify-between w-full border-b lg:border-none border-gray-100 bg-white lg:bg-transparent">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg mr-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex flex-col text-gray-800 flex-1 min-w-0 lg:mr-4">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">Dokumenti</h1>
                            <p className="hidden md:block text-sm lg:text-base text-gray-500 mt-0.5">Pohranite ugovore, ponude i ostale važne datoteke na jednom mjestu</p>
                        </div>
                        <button onClick={() => fileInputRef.current.click()} className="hidden lg:block cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white shadow-md shadow-[#B8926A]/20 px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold hover:shadow-lg active:scale-98 transition-all duration-200 whitespace-nowrap">
                            Dodaj dokument
                        </button>
                    </div>

                    <div className="px-4 md:px-10 lg:px-16 py-4 flex flex-col lg:flex-row gap-8 lg:gap-6 h-fit pb-6 pt-4">
                        <div className="flex flex-col gap-6 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                <DocumentBlock
                                    number={total_documents}
                                    format="Dokumenata"
                                    icon_format={FileText}
                                />
                                <DocumentBlock
                                    number={(total_size / (1024 * 1024)).toFixed(2) + " MB"}
                                    format="Iskorišteno prostora"
                                    icon_format={HardDrive}
                                />
                                <DocumentBlock
                                    number={last_uploaded}
                                    format="Zadnji upload"
                                    icon_format={Clock}
                                />
                            </div>

                            <div onClick={() => fileInputRef.current.click()} className="cursor-pointer items-center justify-center flex flex-col w-full rounded-2xl p-10 border-2 border-dashed border-[#e9e2d6] bg-white hover:border-[#B8926A] hover:bg-[#B8926A]/5 transition-colors duration-200">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#B8926A]/10">
                                    <Upload className="w-6 h-6 text-[#B8926A]" />
                                </div>
                                <p className="text-center text-gray-500 text-sm mt-4">Povucite i ispustite datoteke ovdje ili kliknite za odabir datoteka</p>
                                <p className="hidden md:block text-sm text-[#a39d90] mt-1">PDF, DOC, DOCX &middot; maksimalno 5 MB</p>
                                <p className="md:hidden text-sm text-[#a39d90] mt-1">PDF, DOC, DOCX</p>
                                <p className="md:hidden text-sm text-[#a39d90] mt-1">Maksimalno 5 MB</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col px-4 md:px-10 lg:px-16 pt-6 lg:pt-6 pb-6 items-start justify-between w-full">
                        <div className="flex flex-col w-full ml-2 md:ml-0">
                            <h2 className="text-2xl font-bold tracking-tight">Svi dokumenti</h2>
                            <p className="text-sm text-gray-500">Dokumente sa sustava pronađite niže</p>
                        </div>
                        {(documentResponse?.data || []).length === 0 ? (
                            <div className="shadow-sm flex flex-col items-center justify-center text-center w-full py-16 bg-white rounded-2xl border border-gray-100 mt-4">
                                <div className="w-14 h-14 rounded-full bg-[#B8926A]/10 flex items-center justify-center mb-4">
                                    <FileText className="w-7 h-7 text-[#B8926A]" />
                                </div>
                                <p className="text-gray-500">Trenutačno nemate dodanih dokumenata</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-2 text-[#B8926A] font-bold hover:underline cursor-pointer"
                                >
                                    Dodajte svoj prvi dokument
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-4">
                                {documentResponse.data.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${getFileColor(doc.file_type)}`}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800">{doc.file_name}</span>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-sm text-gray-400">{formatBytes(doc.file_size)}</span>
                                                    <Dot className="w-2 h-2 text-gray-600" />
                                                    <span className="text-sm text-gray-400">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Download className="w-5 h-5 text-yellow-500 hover:text-yellow-700 cursor-pointer" onClick={() => downloadFile(doc.id)} />
                                            <Trash
                                                className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
                                                onClick={() => { setDocumentToDelete(doc.id); setShowDeleteModal(true); }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <DeleteModal
                    onCancel={() => { setShowDeleteModal(false); setDocumentToDelete(null); }}
                    onDelete={() => {
                        if (documentToDelete) {
                            deleteFile(documentToDelete);
                        }
                        setShowDeleteModal(false);
                        setDocumentToDelete(null);
                    }}
                    desc="Jeste li sigurni da želite obrisati ovaj dokument? Ova akcija je nepovratna."
                    deleteText="Da, obriši dokument"
                />
            )}
        </div>
    )
};

export default Documents;
