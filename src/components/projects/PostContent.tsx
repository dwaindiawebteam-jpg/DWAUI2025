import React from 'react'

interface PostContentProps {
  content: string
}

const PostContent: React.FC<PostContentProps> = ({ content }) => {
  return (
    <>
      {content.split("\n\n").map((para: string, index: number) => (
        <p key={index} className="mb-6 text-gray-700 leading-relaxed">
          {para}
        </p>
      ))}
    </>
  )
}

export default PostContent