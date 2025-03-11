<template>
    <div class="post-form-container">
      <div class="form-header">
        <h1>{{ isEditing ? '编辑帖子' : '发布新帖子' }}</h1>
        <el-button @click="goBack">取消</el-button>
      </div>
      
      <el-form 
        ref="formRef" 
        :model="postForm" 
        :rules="rules" 
        label-position="top"
        class="post-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="postForm.title" placeholder="请输入帖子标题" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input 
            v-model="postForm.content" 
            type="textarea" 
            :rows="8" 
            placeholder="请输入帖子内容"
          />
        </el-form-item>
        
        <el-form-item label="标签" prop="tagsId">
          <div class="tags-container">
            <div class="selected-tags">
              <el-tag 
                v-for="tag in selectedTags" 
                :key="tag.id"
                :color="tag.themeColor"
                closable
                @close="removeTag(tag)"
                class="selected-tag"
              >
                {{ tag.name }}
              </el-tag>
            </div>
            
            <div class="tag-selector">
              <el-popover
                placement="bottom"
                :width="300"
                trigger="click"
                :teleported="false"
              >
                <template #reference>
                  <el-button type="primary" plain>
                    <el-icon><Plus /></el-icon>添加标签
                  </el-button>
                </template>
                
                <div class="tag-search">
                  <el-input 
                    v-model="tagSearchKeyword" 
                    placeholder="搜索标签" 
                    @input="searchTags"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                
                <div class="tag-list">
                  <div v-if="availableTags.length === 0" class="no-tags">
                    没有找到标签，您可以创建一个新标签
                  </div>
                  
                  <div 
                    v-for="tag in availableTags" 
                    :key="tag.id"
                    class="tag-item"
                    @click="selectTag(tag)"
                  >
                    <el-tag :color="tag.themeColor" effect="plain">{{ tag.name }}</el-tag>
                  </div>
                </div>
                
                <div class="create-tag">
                  <el-divider>或创建新标签</el-divider>
                  <el-form :model="newTagForm" inline>
                    <el-form-item>
                      <el-input v-model="newTagForm.name" placeholder="标签名称" />
                    </el-form-item>
                    <el-form-item>
                      <div @click.stop> 
                        <el-color-picker
                          v-model="newTagForm.themeColor"
                          size="small"
                          popper-class="color-picker-popper"
                          :teleported="false"
                        />
                      </div>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="createTag" :disabled="!newTagForm.name">创建</el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-popover>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="图片">
          <el-upload
            class="post-image-upload"
            action="/api/common/upload"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
          >
            <div v-if="postForm.image" class="image-preview">
              <el-image :src="postForm.image" fit="cover" />
              <div class="image-actions">
                <el-button type="danger" icon="Delete" circle @click.stop="removeImage" />
              </div>
            </div>
            <el-button v-else type="primary" plain>
              <el-icon><Upload /></el-icon>上传图片
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 jpg/png 文件，且不超过 5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ isEditing ? '保存修改' : '发布帖子' }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import {  sendPostApi, updatePostApi, getPostDetailApi } from '@/api/postApi';
  import { getTagList, addTag } from '@/api/tagsApi';
  import parseJwt from '@/utils/parseJwt';
  
  const route = useRoute();
  const router = useRouter();
  const formRef = ref(null);
  const userId=ref(null);
  
  const isEditing = computed(() => route.params.id !== undefined);
  const postId = computed(() => isEditing.value ? parseInt(route.params.id) : null);
  
  const postForm = ref({
    id: null,
    userId: null,
    title: '',
    content: '',
    image: '',
    tagsId: []
  });
  
  const rules = {
    title: [
      { required: true, message: '请输入帖子标题', trigger: 'blur' },
      { min: 2, max: 50, message: '标题长度应在 2 到 50 个字符之间', trigger: 'blur' }
    ],
    content: [
      { required: true, message: '请输入帖子内容', trigger: 'blur' },
      { min: 10, max: 2000, message: '内容长度应在 10 到 2000 个字符之间', trigger: 'blur' }
    ],
    tagsId: [
      { type: 'array', required: true, message: '请至少选择一个标签', trigger: 'change' }
    ]
  };
  
  const availableTags = ref([]);
  const selectedTags = ref([]);
  const tagSearchKeyword = ref('');
  const newTagForm = ref({
    name: '',
    themeColor: '#409EFF',
    userId: null
  });
  
  const fetchTags = async () => {
    try {
      const response = await getTagList(tagSearchKeyword.value || null);
      if (response.code === 1) {
        availableTags.value = response.data.filter(tag => 
          !selectedTags.value.some(selected => selected.id === tag.id)
        );
      } else {
        ElMessage.error('获取标签列表失败');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      ElMessage.error('获取标签列表时发生错误');
    }
  };
  
  const searchTags = () => {
    fetchTags();
  };
  
  const selectTag = (tag) => {
    if (!selectedTags.value.some(selected => selected.id === tag.id)) {
      selectedTags.value.push(tag);
      postForm.value.tagsId.push(tag.id);
      
      // Remove from available tags
      availableTags.value = availableTags.value.filter(t => t.id !== tag.id);
    }
  };
  
  const removeTag = (tag) => {
    selectedTags.value = selectedTags.value.filter(t => t.id !== tag.id);
    postForm.value.tagsId = postForm.value.tagsId.filter(id => id !== tag.id);
    
    // Add back to available tags
    if (!availableTags.value.some(t => t.id === tag.id)) {
      availableTags.value.push(tag);
    }
  };
  
  const createTag = async () => {
    if (!newTagForm.value.name) return;
    
    try {
      const tagData = {
        name: newTagForm.value.name,
        themeColor: newTagForm.value.themeColor,
        userId: userId.value
      };
      
      const response = await addTag(tagData);
      if (response.code) {
        const newTag = response.data;
        ElMessage.success('创建标签成功');
        // Add to selected tags
        fetchTags();
        
        // Reset form
        newTagForm.value.name = '';
        newTagForm.value.themeColor = '#409EFF';
      } else {
        ElMessage.error('创建标签失败');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      ElMessage.error('创建标签时发生错误');
    }
  };
  
  const handleImageSuccess = (response) => {
    if (response.code === 1) {
      postForm.value.image = response.data;
      ElMessage.success('图片上传成功');
    } else {
      ElMessage.error('图片上传失败');
    }
  };
  
  const beforeImageUpload = (file) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt5M = file.size / 1024 / 1024 < 5;
  
    if (!isImage) {
      ElMessage.error('上传图片只能是 JPG 或 PNG 格式!');
      return false;
    }
    if (!isLt5M) {
      ElMessage.error('上传图片大小不能超过 5MB!');
      return false;
    }
    return true;
  };
  
  const removeImage = () => {
    postForm.value.image = '';
  };
  
  const fetchPostDetail = async () => {
    if (!isEditing.value) return;
    
    try {
      const response = await getPostDetailApi(postId.value);
      if (response.code === 1) {
        const post = response.data;
        
        postForm.value.id = post.id;
        postForm.value.title = post.title;
        postForm.value.content = post.content;
        postForm.value.image = post.image || '';
        
        // Set tags
        if (post.tags && post.tags.length > 0) {
          selectedTags.value = post.tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            themeColor: tag.themeColor
          }));
          postForm.value.tagsId = post.tags.map(tag => tag.id);
        }
      } else {
        ElMessage.error('获取帖子详情失败');
        router.push('/forum');
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      ElMessage.error('获取帖子详情时发生错误');
      router.push('/forum');
    }
  };
  
  const submitForm = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const api = isEditing.value ? updatePostApi : sendPostApi;
          const response = await api(postForm.value);
          
          if (response.code === 1) {
            ElMessage.success(isEditing.value ? '更新帖子成功' : '发布帖子成功');
            
            if (isEditing.value) {
              router.push(`/forum/post/${postId.value}`);
            } else {
              router.push('/forum');
            }
          } else {
            ElMessage.error(isEditing.value ? '更新帖子失败' : '发布帖子失败');
          }
        } catch (error) {
          console.error('Error submitting post:', error);
          ElMessage.error('提交帖子时发生错误');
        }
      } else {
        console.log('error submit!');
        return false;
      }
    });
  };
  
  const goBack = () => {
    router.back();
  };
  
  onMounted(async () => {
    const jwt = localStorage.getItem('user');
    if (jwt) {
      const claim = parseJwt(jwt);
      userId.value = claim.userId;
      postForm.value.userId = userId;
      newTagForm.value.userId = userId;
    }
    
    await fetchTags();
    
    if (isEditing.value) {
      await fetchPostDetail();
    }
  });
  </script>
  
  <style scoped>
  .post-form-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .post-form {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  .tags-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
  }
  
  .tag-search {
    margin-bottom: 10px;
  }
  
  .tag-list {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 15px;
  }
  
  .tag-item {
    padding: 5px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .tag-item:hover {
    background-color: #f5f7fa;
  }
  
  .no-tags {
    text-align: center;
    padding: 10px;
    color: #909399;
  }
  
  .create-tag {
    padding-top: 10px;
  }
  
  .post-image-upload {
    width: 100%;
  }
  
  .image-preview {
    position: relative;
    width: 300px;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .image-preview .el-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 10px;
  }
  
  .el-upload__tip {
    line-height: 1.2;
    margin-top: 5px;
    color: #909399;
  }
  </style>  