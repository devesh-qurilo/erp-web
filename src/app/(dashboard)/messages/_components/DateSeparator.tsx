interface DateSeparatorProps {
    date: string
  }
  
  export default function DateSeparator({ date }: DateSeparatorProps) {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{date}</span>
      </div>
    )
  }