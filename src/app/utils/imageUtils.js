import { supabase } from '../lib/supabase_client'

export const uploadProfileImage = async (file, userId) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `profile-pictures/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('user-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: urlData } = supabase.storage
      .from('user-images')
      .getPublicUrl(filePath)

    return {
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Error uploading profile image:', error)
    throw error
  }
}

export const deleteProfileImage = async (imagePath) => {
  try {
    const { error } = await supabase.storage
      .from('user-images')
      .remove([imagePath])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error deleting profile image:', error)
    throw error
  }
}

export const uploadPostImages = async (files, userId, postId = null) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${postId || Date.now()}-${index}.${fileExt}`
      const filePath = `post-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)

      return {
        url: urlData.publicUrl,
        path: filePath,
        name: file.name,
        size: file.size
      }
    })

    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error('Error uploading post images:', error)
    throw error
  }
}

export const deletePostImages = async (imagePaths) => {
  try {
    const { error } = await supabase.storage
      .from('post-images')
      .remove(imagePaths)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error deleting post images:', error)
    throw error
  }
}

export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(resolve, 'image/jpeg', quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Please use JPEG, PNG, or WebP.')
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Please use images under 5MB.')
  }

  return true
}