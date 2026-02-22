import React from 'react'

interface PostImageProps {
  src: string
  alt: string
}

const PostImage: React.FC<PostImageProps> = ({ src, alt }) => {
  return (
    <div className="flex justify-center mb-8">
      <img
        src={src}
        alt={alt}
        className="w-full md:w-3/4 h-96 md:h-[28rem] object-cover shadow-md"
      />
    </div>
  )
}

export default PostImage