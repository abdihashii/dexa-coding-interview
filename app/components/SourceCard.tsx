import React from 'react';

const SourceCard = ({ title, link }: { title: string; link: string }) => {
  return (
    <li className="p-2 w-1/4 flex flex-col gap-2 border border-black rounded-lg hover:border-slate-300">
      <a href={link} target={'_blank'} rel="noreferrer">
        <h3 className="text-sm line-clamp-2">{title}</h3>
        <p className="text-sm text-slate-500 line-clamp-1">{link}</p>
      </a>
    </li>
  );
};

export default SourceCard;
