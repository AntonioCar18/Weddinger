const TipsTricks = ({ Icon, title, desc }) => {
    return (
        <div className='flex justify-startitems-center pb-4 border-b border-gray-100 last:border-none'>
            <div className="shrink-0">
                <Icon size={25} color='#B8926A'/>
            </div>
            
            <div className='ml-5 flex flex-col gap-1'>
                <h2 className='text-[16px] font-medium text-gray-800'>{title}</h2>
                <p className='text-[13px] text-gray-500 leading-relaxed'>{desc}</p>
            </div>
        </div>
    );
}

export default TipsTricks;