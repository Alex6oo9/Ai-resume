import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const CoverLetterTemplate: React.FC = () => {
    return (
        <div className="w-full min-h-screen bg-gray-100 py-10 flex justify-center font-sans text-gray-900">
            {/* A4 Page Container */}
            <div className="w-full max-w-[816px] bg-white shadow-md relative flex flex-col" style={{ minHeight: '1056px', padding: '48px 64px' }}>

                {/* Header */}
                <header className="mb-10 w-full">
                    <h1 className="text-center text-[54px] font-normal tracking-[0.15em] mb-4 text-black">
                        ARCHITECT
                    </h1>

                    {/* Contact Info */}
                    <div className="flex justify-center items-center space-x-6 text-[13px] font-medium pb-4">
                        <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 fill-black text-white" />
                            <span>your.name@gmail.com</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 fill-black text-white" />
                            <span>(XXX) XXX-XXXX</span>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 fill-black text-white" />
                            <span>142 Your Address Blvd, City Name, CA XXXXX</span>
                        </div>
                    </div>

                    {/* Top Divider */}
                    <hr className="border-t-[1.5px] border-black" />
                </header>

                {/* Body Content */}
                <div className="flex-grow text-[14.5px] leading-[1.65] text-black">
                    <div className="mb-6">
                        <p>[Today's Date]</p>
                    </div>

                    <div className="mb-8">
                        <p>[Hiring Manager's Name]</p>
                        <p>[Company Address]</p>
                        <p>[Company City, State xxxxx]</p>
                        <p>[(xxx)-xxx-xxxx]</p>
                        <p>[hiring.manager@gmail.com]</p>
                    </div>

                    <div className="mb-6">
                        <p>Dear [Mr./Ms.] [Manager's Name],</p>
                    </div>

                    <p className="mb-5">
                        My name is Marcus Winfield, and I'm writing to apply for the position of Junior Architect at R & G
                        Designs Inc. I graduated from Woodbury University's School of Architecture, following which I
                        acquired my architect's license from the California Architects Board [License Number].
                    </p>

                    <p className="mb-5">
                        With more than 2 years of experience in architectural design and drawing, particularly elevations, I
                        bring to your team a trained eye for detail and a keen sense of modern and green aesthetics, as
                        evident from my portfolio. I'm proficient in the use of Autodesk and AutoCAD suites, and I use
                        Autodesk Revit for most of my work in my current role.
                    </p>

                    <p className="mb-5">
                        Although all of my projects are dear to me, I'm particularly proud to have contributed to the Old
                        Vicarage Restoration Project (portfolio drawing #4), which I was a part of since its inception right up
                        to its completion. This wide-ranging experience of a complex, large-scale architectural project (while
                        simultaneously working on other smaller projects) has accelerated my learning — not only my
                        technical design and drawing skills but also such soft skills as time, task, and vendor management.
                    </p>

                    <p className="mb-5">
                        I also have some experience in field work at my current firm, having accompanied and assisted senior
                        architects during on-site inspections and quality control checks. While field visits can be hard work, I
                        personally welcome them as a break from the sedentary office environment.
                    </p>

                    <p className="mb-5">
                        Since graduation, I've engaged in continual learning and development, not only because it would
                        advance my career, but also because I believe sustainable design can help solve some of our biggest
                        challenges, namely global warming and resource scarcity. In this regard, I'm currently preparing to
                        take the LEED Green Associate exam.
                    </p>

                    <p className="mb-8">
                        I am keen to discuss how I can add value to R & G Designs and address questions you may have about
                        me and my portfolio in an in-person interview.
                    </p>

                    <div className="mb-12">
                        <p>Sincerely,</p>
                        <p>Marcus Winfield</p>
                    </div>
                </div>

                {/* Bottom Divider */}
                <div className="mt-auto pt-8">
                    <hr className="border-t-[1.5px] border-black" />
                </div>

            </div>
        </div>
    );
};

export default CoverLetterTemplate;