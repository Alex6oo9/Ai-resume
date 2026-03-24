import { Mail, Phone, MapPin } from 'lucide-react';

interface EditorPanelProps {
  content: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: any) => void;
}

// Forward-declared — passed in as a prop to avoid circular imports
interface BoldArchitectTemplateProps {
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  hiringManagerName: string;
  companyName: string;
  editorHtml: string;
  allKeywords: { keyword: string; matched: boolean }[];
  onEditorChange: (html: string) => void;
  onEditorReady?: (editor: any) => void;
  EditorPanel: React.ComponentType<EditorPanelProps>;
}

export default function BoldArchitectTemplate({
  jobTitle,
  email,
  phone,
  address,
  hiringManagerName,
  companyName,
  editorHtml,
  allKeywords,
  onEditorChange,
  onEditorReady,
  EditorPanel,
}: BoldArchitectTemplateProps) {
  return (
    <div className="bg-white text-black w-full min-h-[1056px] shadow-xl ring-1 ring-black/5 rounded-sm flex flex-col pt-[72px] pb-[72px] px-[80px] font-sans text-[15px] leading-[1.7] relative">

      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col items-center mb-6 w-full">
        {/* Massive, bold, wide-tracked Job Title */}
        <h1 className="text-6xl tracking-[0.1em] mb-6 font-bold uppercase text-center w-full">
          {jobTitle || 'JOB TITLE'}
        </h1>

        {/* Horizontal Contact Info with Icons */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm w-full font-medium">
          {email && (
            <div className="flex items-center gap-2">
              <Mail size={16} className="fill-black text-white shrink-0" />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="fill-black text-white shrink-0" />
              <span>{phone}</span>
            </div>
          )}
          {address && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="fill-black text-white shrink-0" />
              <span>{address}</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= THICK DIVIDER LINE ================= */}
      <div className="w-full h-[2px] bg-black mb-10 shrink-0" />

      {/* ================= DATE & RECIPIENT BLOCK ================= */}
      <div className="mb-8 font-normal text-[15px]">
        <div className="mb-8">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        {(hiringManagerName || companyName) && (
          <div className="flex flex-col gap-1">
            {hiringManagerName && <span className="font-semibold">{hiringManagerName}</span>}
            {companyName && <span>{companyName}</span>}
          </div>
        )}
      </div>

      {/* ================= BODY CONTENT ================= */}
      <div className="flex-1">
        <EditorPanel content={editorHtml} onChange={onEditorChange} onEditorReady={onEditorReady} />
      </div>

      {/* ================= FOOTER: word count + keyword badges ================= */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {editorHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length} words
        </span>
        {allKeywords.slice(0, 8).map(({ keyword, matched }) => (
          <span
            key={keyword}
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${matched ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
          >
            {matched ? '✓' : '✗'} {keyword}
          </span>
        ))}
      </div>

    </div>
  );
}
