interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <>
      {content.split("\n\n").map((para: string, index: number) => (
        <p key={index} className="mb-6 text-gray-700 leading-relaxed">
          {para}
        </p>
      ))}
    </>
  );
}