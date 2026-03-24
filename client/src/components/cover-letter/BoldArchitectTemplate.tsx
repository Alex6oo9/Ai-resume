import { Mail, Phone, MapPin } from 'lucide-react';

interface EditorPanelProps {
  content: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: any) => void;
}

// Forward-declared — passed in as a prop to avoid circular imports
interface BoldArchitectTemplateProps {
  fullName: string;
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
  fullName,
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
    <div className="bg-white text-black w-full min-h-[1056px] shadow-xl ring-1 ring-black/5 rounded-sm flex flex-col py-[48px] px-[64px] font-sans text-[14.5px] leading-[1.65] relative">

      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col items-center w-full">
        {/* Full Name — primary identity */}
        <h1 className="text-[54px] tracking-[0.15em] mb-1 font-normal uppercase text-center w-full">
          {fullName || 'YOUR NAME'}
        </h1>

        {/* Job Title — subtitle */}
        {jobTitle && (
          <p className="text-[15px] tracking-[0.12em] uppercase text-center text-gray-500 mb-3 w-full">
            {jobTitle}
          </p>
        )}

        {/* Horizontal Contact Info with Icons */}
        <div className="flex items-center justify-center space-x-6 text-[13px] font-medium pb-4 w-full">
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

      {/* ================= TOP DIVIDER ================= */}
      <hr className="border-t-[1.5px] border-black mb-10" />

      {/* ================= DATE & RECIPIENT BLOCK ================= */}
      <div className="mb-8 font-normal">
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

      {/* ================= BOTTOM DIVIDER ================= */}
      <div className="mt-auto pt-8">
        <hr className="border-t-[1.5px] border-black mb-4" />
      </div>

      {/* ================= FOOTER: word count + keyword badges ================= */}
      <div className="flex flex-wrap items-center gap-2">
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
