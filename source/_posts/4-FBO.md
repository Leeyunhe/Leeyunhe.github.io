---
title: 帧缓存对象FBO
date: 2023-4-14 21:13:11
categories: 笔记
tags: [嵌入式,OpenGL]
comments: false
description:
typora-root-url: FBO
---

# 帧缓存对象FBO

（Frame Buffer Object）

## Overview

在OpenGL渲染管线中，几何数据和纹理经过多次转化和多次测试，最后以二维像素的形式显示在屏幕上。OpenGL管线的最终渲染目的地被称作帧缓存（framebuffer）。帧缓冲是一些二维数组和OpenG所使用的存储区的集合：颜色缓存、深度缓存、模板缓存和累计缓存。一般情况下，帧缓存完全由window系统生成和管理，由OpenGL使用。这个默认的帧缓存被称作“window系统生成”（window-system-provided）的帧缓存。

<!--more-->

在OpenGL扩展中，GL_EXT_framebuffer_object提供了一种创建额外的不能显示的帧缓存对象的接口。为了和默认的“window系统生成”的帧缓存区别，这种帧缓冲成为应用程序帧缓存（application-createdframebuffer）。通过使用帧缓存对象（FBO），OpenGL可以将显示输出到引用程序帧缓存对象，而不是传统的“window系统生成”帧缓存。而且，它完全受OpenGL控制。

相似于window系统提供的帧缓存，一个FBO也包含一些存储颜色、深度和模板数据的区域。（注意：没有累积缓存）我们把FBO中这些逻辑缓存称之为“帧缓存关联图像”，它们是一些能够和一个帧缓存对象关联起来的二维数组像素。

有两种类型的“帧缓存关联图像”：纹理图像（texture images）和渲染缓存图像（renderbuffer images）。如果纹理对象的图像数据关联到帧缓存，OpenGL执行的是“渲染到纹理”（render to texture）操作。如果渲染缓存的图像数据关联到帧缓存，OpenGL执行的是离线渲染（offscreen rendering）。

这里要提到的是，渲染缓存对象是在GL_EXT_framebuffer_object扩展中定义的一种新的存储类型。在渲染过程中它被用作存储单幅二维图像。

下面这幅图显示了帧缓存对象、纹理对象和渲染缓存对象之间的联系。多多个纹理对象或者渲染缓存对象能够通过关联点关联到一个帧缓存对象上。

![](25.png)

在一个帧缓存对象中有多个颜色关联点（GL_COLOR_ATTACHMENT0_EXT,...,GL_COLOR_ATTACHMENTn_EXT），一个深度关联点（GL_DEPTH_ATTACHMENT_EXT），和一个模板关联点（GL_STENCIL_ATTACHMENT_EXT）。每个FBO中至少有一个颜色关联点，其数目与实体显卡相关。可以通过GL_MAX_COLOR_ATTACHMENTS_EXT来查询颜色关联点的最大数目。FBO有多个颜色关联点的原因是这样可以同时将颜色而换成渲染到多个FBO关联区。这种“多渲染目标”（multiple rendertargets,MRT）可以通过GL_ARB_draw_buffers扩展实现。需要注意的是：FBO本身并没有任何图像存储区，只有多个关联点。

FBO提供了一种高效的切换机制；将前面的帧缓存关联图像从FBO分离，然后把新的帧缓存关联图像关联到FBO。在帧缓存关联图像之间切换比在FBO之间切换要快得多。FBO提供了glFramebufferTexture2DEXT()来切换2D纹理对象和glFramebufferRenderbufferEXT()来切换渲染缓存对象。

## 1、帧缓冲创建

 使用glGenFrameBuffer函数来创建一个帧缓冲（FBO） 

```c
GLuint framebuffer;
glGenFramebuffers(1, &framebuffer);
glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);//绑定
glBindFramebuffer(GL_FRAMEBUFFER, 0);//解绑定
```

绑定到GL_FRAMEBUFFER目标后，接下来所有的读、写帧缓冲的操作都会影响到当前绑定的帧缓冲。也可以把帧缓冲分开绑定到读或写目标上，分别使用GL_READ_FRAMEBUFFER或GL_DRAW_FRAMEBUFFER来做这件事。如果绑定到了GL_READ_FRAMEBUFFER，就能执行所有读取操作，像glReadPixels这样的函数使用了；绑定到GL_DRAW_FRAMEBUFFER上，就允许进行渲染、清空和其他的写入操作。大多数时候你不必分开用，通常绑定到GL_FRAMEBUFFER上就行。

 如果要创建一个完整的帧缓冲，需要满足以下条件：
\- 至少包含一个附件（颜色、深度、或模板）；
\- 其中至少有一个颜色附件；
\- 附件要在附着之前创建好，并存储在内存中；
\- 每个缓冲应该有同样的样本。 

 假如我们创建好一些附件之后，并已经附着到帧缓冲上了，那么接下来要对它进行检查，判断帧缓冲是否完整。

```
if(glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE)
```

 由于使用自定义的帧缓冲，渲染操作并不是对系统提供的默认的帧缓冲，所以并不会对屏幕上图像产生任何影响。如果要切回默认的帧缓冲，可以通过如下函数： 

```
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

 当我们做完所有帧缓冲操作，不要忘记删除帧缓冲对象： 

```
glDeleteFramebuffers(1, &framebuffer);
```

##  2、帧缓冲上可以附着的两种附件 

### 2.1、纹理附件 

纹理附件和通过图片加载的纹理类似，只不过这个纹理附加是通过渲染命令写入到纹理当中的，不是通过图片纹理得到的。

```
GLuint texBuffer;   
glGenTextures(1, &texBuffer);
glBindTexture(GL_TEXTURE_2D, texBuffer);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, WIDTH, HEIGHT, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glBindTexture(GL_TEXTURE_2D, 0);
```



### 2.2、渲染附件





## 3、示例

### 1，离屏渲染到2D纹理

```c
//--------------------1111111111111111----FBO初始化---------------------
		dmaFbId = VTGLR_TEX_IMAGE_DPYFBO_BUF;
		glGenTextures(1,&eglInfo->egiTexImage[dmaFbId].Tex);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, eglInfo->egiTexImage[dmaFbId].Tex);
		glTexImage2D(GL_TEXTURE_2D,0,GL_RGB,416,416,0,GL_RGB,GL_UNSIGNED_BYTE,NULL);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

		if(checkEglErrorState())
		{
			BUG_ERR("pfnglEGLImageTargetTexture2DOES Id:%d EGL Failed",dmaFbId);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_EGL_STATE_ERR;
		}
		if(checkGlErrorState())
		{	
			BUG_ERR("pfnglEGLImageTargetTexture2DOES id:%d GL Failed",dmaFbId);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_GL_STATE_ERR;
		}
		glGenFramebuffers(1, &eglInfo->egiTexImage[dmaFbId].Fb);
		glBindFramebuffer(GL_FRAMEBUFFER, eglInfo->egiTexImage[dmaFbId].Fb);
		glGenRenderbuffers(1, &eglInfo->egiTexImage[dmaFbId].Depth_Fb);
		glBindRenderbuffer(GL_RENDERBUFFER,eglInfo->egiTexImage[dmaFbId].Depth_Fb);//
		glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, eglInfo->egiTexImage[dmaFbId].Width, eglInfo->egiTexImage[dmaFbId].Height);

		glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D, eglInfo->egiTexImage[dmaFbId].Tex, 0);
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, eglInfo->egiTexImage[dmaFbId].Depth_Fb);

		uint32_t glStatus = glCheckFramebufferStatus(GL_FRAMEBUFFER);
		if(glStatus != GL_FRAMEBUFFER_COMPLETE) 
		{
			BUG_ERR("glCheckFramebufferStatusOES Id:%d error 0x%x",dmaFbId, glStatus);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_GL_STATE_ERR;
		}
		if(checkEglErrorState())
		{
			BUG_ERR("pfnglEGLImageTargetTexture2DOES Id:%d EGL Failed",dmaFbId);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_EGL_STATE_ERR;
		}	
		glBindTexture(GL_TEXTURE_2D, 0);
		glBindFramebuffer(GL_FRAMEBUFFER,0);
//--------------------2222222222222222-----离屏渲染与显示到屏幕验证--------------------
glBindFramebuffer(GL_FRAMEBUFFER, eglInfo->egiTexImage[VTGLR_TEX_IMAGE_DPYFBO_BUF].Fb);
	glm::mat4 Identity(1.0f);
	glEnable(GL_BLEND);
	glDisable(GL_DEPTH_TEST);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glViewport(window.x, window.y, window.width, window.height);
	glUseProgram(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle());
	glActiveTexture(GL_TEXTURE0);
	pFNglbindvertexarrayOES(VTGL_Obj[VTGLR_COMMON_WIN_OBJ].vao);
	glBindTexture(GL_TEXTURE_EXTERNAL_OES, VT_GetCamEglTex(camera, gCameraBufIndex[camera]));//
	glUniform1i(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "myTexture"), 0);
	glUniformMatrix4fv(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "mvp"), 1, GL_FALSE, glm::value_ptr(Identity));
	glDrawArrays(GL_TRIANGLES, 0,6);
	pFNglbindvertexarrayOES(0);  
	glDisable(GL_BLEND);
	glFlush();
glBindFramebuffer(GL_FRAMEBUFFER, 0);

	glm::mat4 Identity(1.0f);
	glEnable(GL_BLEND);
	glDisable(GL_DEPTH_TEST);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glViewport(416, 0, 416, 416);
	glUseProgram(CommonRenderProg[VTGLR_COMMON_PROG_2D].Prog->getHandle());
	glActiveTexture(GL_TEXTURE0);
	pFNglbindvertexarrayOES(VTGL_Obj[VTGLR_COMMON_WIN_OBJ].vao);
	glBindTexture(GL_TEXTURE_2D, eglInfo->egiTexImage[VTGLR_TEX_IMAGE_DPYFBO_BUF].Tex);//
	glUniform1i(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_2D].Prog->getHandle(), "myTexture"), 0);
	glUniformMatrix4fv(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_2D].Prog->getHandle(), "mvp"), 1, GL_FALSE, glm::value_ptr(Identity));
	glDrawArrays(GL_TRIANGLES, 0,6);
	glBindTexture(GL_TEXTURE_2D, 0);
	pFNglbindvertexarrayOES(0);  
	glDisable(GL_BLEND);
	glFlush();
	eglSwapBuffers(eglInfo->egl_display, eglInfo->egl_surface);
```

### 2，离屏渲染到外部OES纹理

```c
//--------------------1111111111111111----FBO初始化---------------------
		dmaFbId = VTGLR_TEX_IMAGE_DPYFBO_BUF;
		glGenTextures(1,&eglInfo->egiTexImage[dmaFbId].Tex);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_EXTERNAL_OES, eglInfo->egiTexImage[dmaFbId].Tex);
		glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
		glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
		pfnglEGLImageTargetTexture2DOES(GL_TEXTURE_EXTERNAL_OES, (GLeglImageOES)img);

		if(checkEglErrorState())
		{
			BUG_ERR("pfnglEGLImageTargetTexture2DOES Id:%d EGL Failed",dmaFbId);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_EGL_STATE_ERR;
		}
		if(checkGlErrorState())
		{	
			BUG_ERR("pfnglEGLImageTargetTexture2DOES id:%d GL Failed",dmaFbId);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_GL_STATE_ERR;
		}
		glGenFramebuffers(1, &eglInfo->egiTexImage[dmaFbId].Fb);
		glBindFramebuffer(GL_FRAMEBUFFER, eglInfo->egiTexImage[dmaFbId].Fb);
		glGenRenderbuffers(1, &eglInfo->egiTexImage[dmaFbId].Depth_Fb);
		glBindRenderbuffer(GL_RENDERBUFFER,eglInfo->egiTexImage[dmaFbId].Depth_Fb);//
		glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, eglInfo->egiTexImage[dmaFbId].Width, eglInfo->egiTexImage[dmaFbId].Height);

		glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,GL_TEXTURE_EXTERNAL_OES, eglInfo->egiTexImage[dmaFbId].Tex, 0);
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, eglInfo->egiTexImage[dmaFbId].Depth_Fb);

		uint32_t glStatus = glCheckFramebufferStatus(GL_FRAMEBUFFER);
		if(glStatus != GL_FRAMEBUFFER_COMPLETE) 
		{
			BUG_ERR("glCheckFramebufferStatusOES Id:%d error 0x%x",dmaFbId, glStatus);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_GL_STATE_ERR;
		}
		if(checkEglErrorState())
		{
			BUG_ERR("pfnglEGLImageTargetTexture2DOES Id:%d EGL Failed",dmaFbId);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_EGL_STATE_ERR;
		}
		glBindTexture(GL_TEXTURE_EXTERNAL_OES, 0);
		glBindFramebuffer(GL_FRAMEBUFFER,0);
//--------------------2222222222222222-----离屏渲染与显示到屏幕验证--------------------
glBindFramebuffer(GL_FRAMEBUFFER, eglInfo->egiTexImage[VTGLR_TEX_IMAGE_DPYFBO_BUF].Fb);
	glm::mat4 Identity(1.0f);
	glEnable(GL_BLEND);
	glDisable(GL_DEPTH_TEST);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glViewport(window.x, window.y, window.width, window.height);
	glUseProgram(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle());
	glActiveTexture(GL_TEXTURE0);
	pFNglbindvertexarrayOES(VTGL_Obj[VTGLR_COMMON_WIN_OBJ].vao);
	glBindTexture(GL_TEXTURE_EXTERNAL_OES, VT_GetCamEglTex(camera, gCameraBufIndex[camera]));//
	glUniform1i(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "myTexture"), 0);
	glUniformMatrix4fv(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "mvp"), 1, GL_FALSE, glm::value_ptr(Identity));
	glDrawArrays(GL_TRIANGLES, 0,6);
	pFNglbindvertexarrayOES(0);  
	glDisable(GL_BLEND);
	glFlush();
glBindFramebuffer(GL_FRAMEBUFFER, 0);

	glm::mat4 Identity(1.0f);
	glEnable(GL_BLEND);
	glDisable(GL_DEPTH_TEST);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glViewport(416, 0, 416, 416);
	glUseProgram(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle());
	glActiveTexture(GL_TEXTURE0);
	pFNglbindvertexarrayOES(VTGL_Obj[VTGLR_COMMON_WIN_OBJ].vao);
	glBindTexture(GL_TEXTURE_EXTERNAL_OES, eglInfo->egiTexImage[VTGLR_TEX_IMAGE_DPYFBO_BUF].Tex);//
	glUniform1i(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "myTexture"), 0);
	glUniformMatrix4fv(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "mvp"), 1, GL_FALSE, glm::value_ptr(Identity));
	glDrawArrays(GL_TRIANGLES, 0,6);
	glBindTexture(GL_TEXTURE_EXTERNAL_OES, 0);
	pFNglbindvertexarrayOES(0);  
	glDisable(GL_BLEND);
	glFlush();
	eglSwapBuffers(eglInfo->egl_display, eglInfo->egl_surface);
```

### 3，离屏渲染2D或OES纹理（宏方式切换）

```c

//--------------------1111111111111111----FBO初始化---------------------
		dmaFbId = VTGLR_TEX_IMAGE_DPYFBO_BUF;

		glGenTextures(1,&eglInfo->egiTexImage[dmaFbId].Tex);
		glActiveTexture(GL_TEXTURE0);

	#if FBO_TEXTURE
		glBindTexture(GL_TEXTURE_EXTERNAL_OES, eglInfo->egiTexImage[dmaFbId].Tex);

		glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
		glTexParameteri(GL_TEXTURE_EXTERNAL_OES, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
		pfnglEGLImageTargetTexture2DOES(GL_TEXTURE_EXTERNAL_OES, (GLeglImageOES)img);

	#else
		glBindTexture(GL_TEXTURE_2D, eglInfo->egiTexImage[dmaFbId].Tex);
		glTexImage2D(GL_TEXTURE_2D,0,GL_RGB,416,416,0,GL_RGB,GL_UNSIGNED_BYTE,NULL);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	#endif

		if(checkEglErrorState())
		{
			BUG_ERR("pfnglEGLImageTargetTexture2DOES Id:%d EGL Failed",dmaFbId);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_EGL_STATE_ERR;
		}
		if(checkGlErrorState())
		{	
			BUG_ERR("pfnglEGLImageTargetTexture2DOES id:%d GL Failed",dmaFbId);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_GL_STATE_ERR;
		}
		glGenFramebuffers(1, &eglInfo->egiTexImage[dmaFbId].Fb);
		glBindFramebuffer(GL_FRAMEBUFFER, eglInfo->egiTexImage[dmaFbId].Fb);

		glGenRenderbuffers(1, &eglInfo->egiTexImage[dmaFbId].Depth_Fb);
		glBindRenderbuffer(GL_RENDERBUFFER,eglInfo->egiTexImage[dmaFbId].Depth_Fb);//
		glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, eglInfo->egiTexImage[dmaFbId].Width, eglInfo->egiTexImage[dmaFbId].Height);


	#if FBO_TEXTURE
		glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,GL_TEXTURE_EXTERNAL_OES, eglInfo->egiTexImage[dmaFbId].Tex, 0);
	#else
		glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D, eglInfo->egiTexImage[dmaFbId].Tex, 0);
	#endif
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, eglInfo->egiTexImage[dmaFbId].Depth_Fb);

		uint32_t glStatus = glCheckFramebufferStatus(GL_FRAMEBUFFER);
		if(glStatus != GL_FRAMEBUFFER_COMPLETE) 
		{
			BUG_ERR("glCheckFramebufferStatusOES Id:%d error 0x%x",dmaFbId, glStatus);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_GL_STATE_ERR;
		}
		if(checkEglErrorState())
		{
			BUG_ERR("pfnglEGLImageTargetTexture2DOES Id:%d EGL Failed",dmaFbId);
			return GLR_EGL_IMAGETARGET_TEXTURE2D_EGL_STATE_ERR;
		}	
	#if FBO_TEXTURE
		glBindTexture(GL_TEXTURE_EXTERNAL_OES, 0);
	#else
		glBindTexture(GL_TEXTURE_2D, 0);
	#endif

		glBindFramebuffer(GL_FRAMEBUFFER,0);

//--------------------2222222222222222-----离屏渲染与显示到屏幕验证--------------------
glBindFramebuffer(GL_FRAMEBUFFER, eglInfo->egiTexImage[VTGLR_TEX_IMAGE_DPYFBO_BUF].Fb);

	glm::mat4 Identity(1.0f);
	glEnable(GL_BLEND);
	glDisable(GL_DEPTH_TEST);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glViewport(window.x, window.y, window.width, window.height);
	glUseProgram(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle());
	glActiveTexture(GL_TEXTURE0);
	pFNglbindvertexarrayOES(VTGL_Obj[VTGLR_COMMON_WIN_OBJ].vao);
	glBindTexture(GL_TEXTURE_EXTERNAL_OES, VT_GetCamEglTex(camera, gCameraBufIndex[camera]));//
	glUniform1i(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "myTexture"), 0);
	glUniformMatrix4fv(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "mvp"), 1, GL_FALSE, glm::value_ptr(Identity));
	glDrawArrays(GL_TRIANGLES, 0,6);
	pFNglbindvertexarrayOES(0);  
	glDisable(GL_BLEND);
	glFlush();

glBindFramebuffer(GL_FRAMEBUFFER, 0);


	glm::mat4 Identity(1.0f);
	glEnable(GL_BLEND);
	glDisable(GL_DEPTH_TEST);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glViewport(416, 0, 416, 416);

	#if FBO_TEXTURE
	glUseProgram(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle());
	glActiveTexture(GL_TEXTURE0);
	pFNglbindvertexarrayOES(VTGL_Obj[VTGLR_COMMON_WIN_OBJ].vao);
	glBindTexture(GL_TEXTURE_EXTERNAL_OES, eglInfo->egiTexImage[VTGLR_TEX_IMAGE_DPYFBO_BUF].Tex);//
	glUniform1i(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "myTexture"), 0);
	glUniformMatrix4fv(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_CAMVIEW].Prog->getHandle(), "mvp"), 1, GL_FALSE, glm::value_ptr(Identity));
	glDrawArrays(GL_TRIANGLES, 0,6);
	glBindTexture(GL_TEXTURE_EXTERNAL_OES, 0);

	#else

	//2D纹理显示
	glUseProgram(CommonRenderProg[VTGLR_COMMON_PROG_2D].Prog->getHandle());
	glActiveTexture(GL_TEXTURE0);
	pFNglbindvertexarrayOES(VTGL_Obj[VTGLR_COMMON_WIN_OBJ].vao);
	glBindTexture(GL_TEXTURE_2D, eglInfo->egiTexImage[VTGLR_TEX_IMAGE_DPYFBO_BUF].Tex);//
	glUniform1i(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_2D].Prog->getHandle(), "myTexture"), 0);
	glUniformMatrix4fv(glGetUniformLocation(CommonRenderProg[VTGLR_COMMON_PROG_2D].Prog->getHandle(), "mvp"), 1, GL_FALSE, glm::value_ptr(Identity));
	glDrawArrays(GL_TRIANGLES, 0,6);
	glBindTexture(GL_TEXTURE_2D, 0);

	#endif

	pFNglbindvertexarrayOES(0);  
	glDisable(GL_BLEND);
	glFlush();
	eglSwapBuffers(eglInfo->egl_display, eglInfo->egl_surface);

```

