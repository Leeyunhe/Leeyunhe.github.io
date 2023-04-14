---
title: G2D
date: 2023-4-14 18:08:11
categories: 笔记
tags: 嵌入式
comments: false
description:
typora-root-url: G2D
---

<div align = "center">G2D</div>


## 	1.什么是跟g2d？

​	G2D也就是我们说的2d加速。很久以前，绘图工作全部是由我们伟大而神圣的 CPU 来完成的，那时候的显卡，就是真正意义上用来“显示东西的卡”。它的工作就是把 CPU 处理好的数据“搬”到显示器上来。那时候 CPU 的工作可真是辛苦。现在好了，CPU 越来越快，可是做的工作却越来越少了。先来说说图形加速的几个阶段。2D 图像加速，Windows 加速 和 3D 图像加速。

<!--more-->

​	2D 加速，是早就有的产物了。它的作用是用 显示芯片 来代替 CPU，整块整块的移动显存里的数据。比如，你要移动一个窗口，在没有 2D 加速的时代，CPU 所作的工作：1、找到窗口在显存中的地址，2、把一行数据拷贝到目的地址，3、重复 2 直到拷贝完所有的行。完成。这样一来，当窗口很大的时候，CPU 要处理的数据量就会成倍的增长，导致窗口的移动比蜗牛爬还慢…. 想体验一下吗？好，进入设备管理器，把你的显卡驱动删掉，然后重起…. 好好享受啊！呵呵 

​	有了 2D 加速呢，CPU 所做的事，减轻了很多，不过还是要指导 显示芯片 来干这搬运工的活。CPU 的工作：1、找到窗口在显存中的地址，2、给 显卡发送 “拷贝这一行到目的地”的命令。3、重复 2 直到拷贝完所有的行。初看起来好像和没有加速以前差不多，可是第 2 步就是关键所在哦。 

​	现在让我们把第二步分解来看：没有 2D 加速：1、读 32 Bit 数据(入门篇里的哦！)，把这 32 Bit 数据写入目的地。2、重复 1 直到一行所有的像素被处理完。而有了 2D 加速后的工作只有：1、发送命令让显卡去拷贝这一行。这样看来，2D 加速确实能很大程度的释放 CPU 的负担。所以大家现在随便提起一个窗口移动一下，很平滑不是吗？显卡负责了窗口的移动。



## 2.支持的功能有哪些?

​	转码，缩放，位块传输......(不同芯片支持的具体功能不尽相同)

![](1.png)

```
支持图层大小最高至2048*2048像素点
支持输入/输出格式：YUV422（sp、planner）、YUV420（sp、planer）......
支持水平和垂直翻转，顺时针 0/90/180/270度 旋转
```



## 3.函数接口命令

```cpp
//fd:G2D设备文件标识符，cmd:命令码，arg:对应结构体指针
int ioctl(int * fd, int cmd, unsigned long arg);
//常见cmd功能、与结构体对应关系
G2D_CMD_BITBLT_H //实现单幅图的缩放，格式转换。实现foreground带缩放的ROP2处理 >> g2d_blt_h
G2D_CMD_BITBLT //实现两个图层的运算，如：源拷贝到目标；源旋转放入目标；源和目标做alpha blending /colorkey 后拷到目标。>> g2d_blt 
G2D_CMD_STRETCHBLT	//实现两个图层的运算，如：源缩放到目标大小后拷贝到目标；源缩放到目标大小后旋转放入目标；源缩放到目标大小后和目标做做alpha blending /colorkey 后拷到目标。>> g2d_stretchblt
G2D_CMD_MEM_REQUEST //为测试程序提供内存申请接口 >>arg为申请buffer的size
G2D_CMD_MEM_GETADR //为测试程序提供内存物理地址 >>arg为申请buffer的编号（1~10）
G2D_CMD_MEM_RELEALSE //为测试程序提供内存物理地址 >>arg为申请buffer的编号（1~10）
```

​	注意：G2D使用时，传入的地址只能是物理地址，不能是应用空间申请的虚拟地址。所以测试时，需要alloc_mem的方式申请一片内存空间，得到其物理地址，才能进行G2D调用。

## 4.数据结构

### g2d_blt_h

```cpp
typedef struct {
    g2d_blt_flags_h	flag_h;//blt操作flag标志
    g2d_image_enh	src_image_h;//源图像信息
    g2d_image_enh	dst_image_h;//目标图像信息
    __u32			color;//colorkey颜色
    __u32			alpha;//面alpha值
} g2d_blt_h;
```

### g2d_blt

```cpp
typedef struct {
    g2d_blt_flags	flag;//blt操作flag标志
    g2d_image		src_image;//源图像信息
    g2d_rect		src_rect;//源矩形信息，x/y/w/h-左上角x/左上角y/宽/高
    g2d_image		dst_image;//目标图像信息
    __s32			dst_x;//目标矩阵左上角x
    __s32			dst_y;//目标矩阵左上角y
    __u32			color;//colorkey颜色
    __u32			alpha;//面alpha值
}g2d_blt;
```

### g2d_stretchblt

```cpp
typedef struct {
    g2d_blt_flags	flag;//blt操作flag标志
    g2d_image		src_image;//源图像信息
    g2d_rect		src_rect;//源矩形信息，x/y/w/h-左上角x/左上角y/宽/高
    g2d_image		dst_image;//目标图像信息
	g2d_rect		dst_rect;//目标矩形信息，x/y/w/h-左上角x/左上角y/宽/高
    __u32			color;//colorkey颜色
    __u32			alpha;//面alpha值
}g2d_stretchblt;
```

### g2d_image

主要用于描述image属性信息

```cpp
typedef struct {
    __u32	addr[3];//图像帧的基地址，对于UV combined ，addr[0,1]有效，planner类型addr[0,1,2]有效，其他addr[0]有效
    __u32	w;//图像帧的宽
    __u32	h;//图像帧的高
    g2d_data_fmt	format;//图像帧buffer的像素格式
    g2d_pixel_seq	pixel_seq;//图像帧buffer的像素序列
}g2d_image;
```

### g2d_image_enh

​	主要描述图片的宽高、存放地址、是否做Clip处理，是否为预乘等

```cpp
typedef struct {
    int		bbuff;
    g2d_fmt_enh	format;//图格式
    __u32	laddr[3];//起始低位地址
    __u32	haddr[3];//起始高位地址
    __u32	width;//图宽
    __u32	height;//图高
    __u32	align[3];
    g2d_rect		clip_rect;//ROI矩形
    __u32	gamut;//图的色域
    int		bpremul;//是否为预乘
    __u8	alpha;//面alpha值
    g2d_alpha_mode_enh	mode;//alpha模式设置
}g2d_image_enh;
```

​	laddr以及haddr是针对32为以及64位处理器的一个适配，32位处理器只需要填充laddr，64位则需要填充laddr和haddr

### g2d_blt_flags

```cpp
typedef enum{
    G2D_BLT_NONE			= 0x00000000,//纯拷贝
    G2D_BLT_PIXEL_ALPHA		= 0x00000001,//点alpha标志
    G2D_BLT_PLANE_ALPHA 	= 0x00000002,//面alpha标志
    G2D_BLT_MULTI_ALPHA 	=0x00000004,//混合alpha标志
    G2D_BLT_SRC_COLORKEY 	= 0x00000008,//源colorkey标志
    G2D_BLT_DST_COLORKEY 	= 0x00000010,//目标colorkey标志
    G2D_BLT_FLIP_HORIZONTAL = 0x00000020,//水平翻转
    G2D_BLT_VERTICAL		= 0x00000040,//垂直翻转
    G2D_BLT_ROTATE90		= 0x00000080,//逆时针旋转90度
    G2D_BLT_ROTATE180 		= 0x00000100,//逆时针旋转180度
    G2D_BLT_ROTATE270 		= 0x00000200,//逆时针旋转270度
    G2D_BLT_MIRROR45 		= 0x00000400,//镜像45度
    G2D_BLT_MIRROR135		 = 0x00000800,//镜像135度
}g2d_blt_flags
```

### g2d_blt_flags_h

```

```



## 5.举例

1.可参考虚拟机中.../sdk_demo/G2dDemo。

2.也可参考全志G2D开发指南

### 1.旋转，缩放与格式转换

```cpp
g2d_blt_h blit;//实例化一个对象，进行参数填充

blit.flag_h = G2D_BLT_NONE_0;//修改此参数实现旋转。如：G2D_ROT_90旋转90度
blit.src_image_h.fd = src_buffd;//源图像
//blit.src_image_h.format = G2D_FORMAT_YUV420_PLANAR;
blit.src_image_h.format = G2D_FORMAT_ARGB8888;
blit.src_image_h.mode = G2D_GLOBAL_ALPHA;
blit.src_image_h.clip_rect.x = 0;
blit.src_image_h.clip_rect.y = 0;
blit.src_image_h.clip_rect.w = 320;
blit.src_image_h.clip_rect.h = 480;
 blit.src_image_h.width = 320;
blit.src_image_h.height = 480;
blit.src_image_h.alpha = 0xff;
blit.dst_image_h.fd = dst_buffd;//目标图像
//blit.dst_image_h.format = G2D_FORMAT_YUV420_PLANAR;	
blit.dst_image_h.format = G2D_FORMAT_ARGB8888;//修改此格式可改变输出格式
blit.dst_image_h.mode = G2D_GLOBAL_ALPHA;
blit.dst_image_h.clip_rect.x = 0;
blit.dst_image_h.clip_rect.y = 0;
blit.dst_image_h.clip_rect.w = 320;//修改此参数可实现缩放
blit.dst_image_h.clip_rect.h = 480;//修改此参数可实现缩放
blit.dst_image_h.alpha = 0xff; 
blit.dst_image_h.width = 320;//与上保持一致
blit.dst_image_h.height = 480;//与上保持一致

if(ioctl(g2d_fd,  G2D_CMD_BITBLT_H ,(unsigned long)(&blit)) < 0)
{
	printf("[%d][%s][%s]G2D_CMD_BITBLT_H failure!\n",__LINE__, __FILE__,__FUNCTION__);
	return -1;
}
```

### 2.输入输出

```cpp
g2d_blt blit;
//设置BITBLT flag标志位
blit.color = 0xff;
blit.alpha = 0xff;
blit.flag = G2D_BLT_NONE;//纯拷贝
//设置源image和rect
blit.src_image.addr[0] = memin;
blit.src_image.w = 800;
blit.src_image.h = 480;
blit.src_image.format = G2D_FMT_RGBA8888;	
blit.src_image.pixel_seq = G2D_SEQ_NORMAL;
blit.src_rect.x = 0;
blit.src_rect.y = 0;
blit.src_rect.w = 480;
blit.src_rect.h = 272;
//设置目标image和rect
blit.dst_image.addr[0] = memout;
blit.dst_image.w = 800;
blit.dst_image.h = 480;
blit.dst_image.format = G2D_FMT_RGBA8888;
blit.dst_image.pixel_seq = G2D_SEQ_NORMAL;
blit.dst_x = 0;
blit.dst_y = 0;

if(ioctl(g2d_fd, G2D_CMD_BITBLT, &blit_para) < 0)
{
	print("G2D_CMD_BITBLT failure!\n");
	return -1;
}
```

### 3.缩放

```cpp
g2d_stretchblt scale;
	int retval = -1;

	scale.flag = G2D_BLT_NONE;
	scale.src_image.addr[0] = (unsigned long)psrc;
	//scale.src_image.addr[1] = (unsigned long)psrc + src_w * src_h;
	scale.src_image.w = src_w;
	scale.src_image.h = src_h;
	//scale.src_image.format = G2D_FMT_PYUV420UVC;
	scale.src_image.format = G2D_FMT_XRGB8888;
	scale.src_image.pixel_seq = G2D_SEQ_NORMAL;
	scale.src_rect.x = src_crop_x;
	scale.src_rect.y = src_crop_y;
	scale.src_rect.w = src_crop_w;
	scale.src_rect.h = src_crop_h;
	scale.dst_image.addr[0] = (unsigned long)pdst;
	//scale.dst_image.addr[1] = (unsigned long)pdst + dst_w * dst_h;
	scale.dst_image.w = dst_w;
	scale.dst_image.h = dst_h;
	//scale.dst_image.format = G2D_FMT_PYUV420UVC;	
	scale.dst_image.format = G2D_FMT_XRGB8888;
	scale.dst_image.pixel_seq = G2D_SEQ_NORMAL;
	scale.dst_rect.x = dst_crop_x;
	scale.dst_rect.y = dst_crop_y;
	scale.dst_rect.w = dst_crop_w;
	scale.dst_rect.h = dst_crop_h;
	scale.color = 0xff;
	scale.alpha = 0xff;	
	
	if(ioctl(g2d_fd,  G2D_CMD_STRETCHBLT ,(unsigned long)(&scale)) < 0)
	{
		printf("[%d][%s][%s]G2D_CMD_STRETCHBLT failure!\n",
			__LINE__, __FILE__,__FUNCTION__);
		return -1;
	}
```

## 6.应用层申请内核地址的办法

### 1.G2D命令码

```cpp
G2D_CMD_MEM_REQUEST //为测试程序提供内存申请接口 >>arg为申请buffer的size
G2D_CMD_MEM_GETADR //为测试程序提供内存物理地址 >>arg为申请buffer的编号（1~10）
G2D_CMD_MEM_RELEALSE //为测试程序提供内存物理地址 >>arg为申请buffer的编号（1~10）
```

### 2.alloc_mem

```c
//如：****alloc_buffer->phy = 0xfa200000,alloc_buffer->vir = 0x7f71081000
```

参考：

```cpp
#include "sunxiMemInterface.h"
#include "G2dApi.h"

VTint32 VTG2D_ClipByFd(VTint32 src_buffd, VTint32 dst_buffd,VTint32 dst_x,VTint32 dst_y)
{
	g2d_blt_h blit;

	blit.flag_h = G2D_ROT_0;//G2D_BLT_NONE_H
	blit.src_image_h.fd = src_buffd;
	blit.src_image_h.format = G2D_FORMAT_YUV420UVC_U1V1U0V0;//NV12
	blit.src_image_h.mode = G2D_GLOBAL_ALPHA;
	blit.src_image_h.clip_rect.x = 0;
	blit.src_image_h.clip_rect.y = 0;
	blit.src_image_h.clip_rect.w = 1280;
	blit.src_image_h.clip_rect.h = 720;
	blit.src_image_h.width = 1280;
	blit.src_image_h.height = 720;
	blit.src_image_h.alpha = 0xff; 

	blit.src_image_h.fd = dst_buffd;
	blit.dst_image_h.format = G2D_FORMAT_YUV420UVC_U1V1U0V0;	
	blit.dst_image_h.mode = G2D_GLOBAL_ALPHA;
	blit.dst_image_h.clip_rect.x = dst_x;
	blit.dst_image_h.clip_rect.y = dst_y;
	blit.dst_image_h.clip_rect.w = 1280;
	blit.dst_image_h.clip_rect.h = 720;
	blit.dst_image_h.width = 3840;
	blit.dst_image_h.height = 1440;
	blit.dst_image_h.alpha = 0xff; 

	if(ioctl(g2d_fd,  G2D_CMD_BITBLT_H ,(unsigned long)(&blit)) < 0)
	{
		printf("[%d][%s][%s]G2D_CMD_BITBLT_H failure!\n",
			__LINE__, __FILE__,__FUNCTION__);
		return -1;
	}

	return 0;
}
int allocPicMem(paramStruct_t*pops,int size)
{
    int iRet = 0;

    iRet = allocOpen(MEM_TYPE_CDX_NEW, pops, NULL);
    if (iRet < 0) {
        printf("ion_alloc_open failed\n");
        return iRet;
    }
    pops->size =size;
    iRet = allocAlloc(MEM_TYPE_CDX_NEW, pops, NULL);
    if(iRet < 0) {
        printf("allocAlloc failed\n");
        return iRet;
    }

    return 0;
}
int freePicMem(paramStruct_t*pops)
{
	int iRet = 0;
	allocFree(MEM_TYPE_CDX_NEW, pops, NULL);

    return 0;
}
int ReadPicFileContent(char *pPicPath,paramStruct_t*pops,int size)
{
    allocPicMem(pops,size);

    FILE *fpff = fopen(pPicPath, "rb");
    if(NULL == fpff) {
        fpff = fopen(pPicPath, "rb");
        if(NULL == fpff) {
            printf("fopen %s ERR \n", pPicPath);
            allocFree(MEM_TYPE_CDX_NEW, pops, NULL);
            return -1;
        } else {
            printf("fopen %s OK \n", pPicPath);
            fread((void *)pops->vir, 1, size, fpff);
            fclose(fpff);
        }
    } else {
        printf("fopen %s OK \n", pPicPath);
        fread((void *)pops->vir, 1, size, fpff);
        fclose(fpff);
    }
	flushCache(MEM_TYPE_CDX_NEW,pops, NULL);

    return 0;
}
int WritePicFileContent(char *pPicPath,paramStruct_t*pops,int size)
{
    int iRet = 0;
	printf("WritePicFileContent size=%d \n",size);
	flushCache(MEM_TYPE_CDX_NEW,pops, NULL);

    FILE *fpff = fopen(pPicPath, "wb");
    if(NULL == fpff) {
        fpff = fopen(pPicPath, "wb");
        if(NULL == fpff) {
            printf("fopen %s ERR \n", pPicPath);
            allocFree(MEM_TYPE_CDX_NEW, pops, NULL);
            return -1;
        } else {
            printf("fopen %s OK \n", pPicPath);
            fwrite((void *)pops->vir, 1, size, fpff);
            fclose(fpff);
        }
    } else {
        printf("fopen %s OK \n", pPicPath);
        fwrite((void *)pops->vir, 1, size, fpff);
        fclose(fpff);
    }
    return 0;
}
int VT_G2D_6in1compose(int iSubWidth,int iSubHeight,int iWidth,int iHeight)
{
	paramStruct_t m_DispMemOps;
	paramStruct_t m_DispMemOps0;
	paramStruct_t m_DispMemOps1;
	paramStruct_t m_DispMemOps2;
	paramStruct_t m_DispMemOps3;
	paramStruct_t m_DispMemOps4;
	paramStruct_t m_DispMemOps5;
	char *pcompPicPath0="cvideo.yuv";
	char *pPicPath0="Video[0]_picture0.yuv";
	char *pPicPath1="Video[1]_picture0.yuv";
	char *pPicPath2="Video[2]_picture0.yuv";
	char *pPicPath3="Video[3]_picture0.yuv";
	char *pPicPath4="Video[4]_picture0.yuv";
	char *pPicPath5="Video[5]_picture0.yuv";

		ReadPicFileContent(pPicPath0,&m_DispMemOps0,iSubWidth*iSubHeight*3/2);
		ReadPicFileContent(pPicPath1,&m_DispMemOps1,iSubWidth*iSubHeight*3/2);
		ReadPicFileContent(pPicPath2,&m_DispMemOps2,iSubWidth*iSubHeight*3/2);
		ReadPicFileContent(pPicPath3,&m_DispMemOps3,iSubWidth*iSubHeight*3/2);
		ReadPicFileContent(pPicPath4,&m_DispMemOps4,iSubWidth*iSubHeight*3/2);
		ReadPicFileContent(pPicPath5,&m_DispMemOps5,iSubWidth*iSubHeight*3/2);

		allocPicMem(&m_DispMemOps,iWidth*iHeight*3/2);
		int outfd = m_DispMemOps.ion_buffer.fd_data.aw_fd;
		int infd[6];
		infd[0] = m_DispMemOps0.ion_buffer.fd_data.aw_fd;
		infd[1] = m_DispMemOps1.ion_buffer.fd_data.aw_fd;
		infd[2] = m_DispMemOps2.ion_buffer.fd_data.aw_fd;
		infd[3] = m_DispMemOps3.ion_buffer.fd_data.aw_fd;
		infd[4] = m_DispMemOps4.ion_buffer.fd_data.aw_fd;
		infd[5] = m_DispMemOps5.ion_buffer.fd_data.aw_fd;
		int ret = -1;
		ret  = VTG2D_ClipByFd(infd[0],outfd,0,0);
		g2dClipByFd();
		ret |= VTG2D_ClipByFd(infd[1],outfd,iSubWidth,0);
		ret |= VTG2D_ClipByFd(infd[2],outfd,iSubWidth*2,0);
		ret |= VTG2D_ClipByFd(infd[3],outfd,0,iSubHeight);
		ret |= VTG2D_ClipByFd(infd[4],outfd,iSubWidth,iSubHeight);
		ret |= VTG2D_ClipByFd(infd[5],outfd,iSubWidth*2,iSubHeight);
		WritePicFileContent(pcompPicPath0,&m_DispMemOps,iWidth*iHeight*3/2);
		freePicMem(&m_DispMemOps);
		freePicMem(&m_DispMemOps0);
		freePicMem(&m_DispMemOps1);
		freePicMem(&m_DispMemOps2);
		freePicMem(&m_DispMemOps3);
		freePicMem(&m_DispMemOps4);
		freePicMem(&m_DispMemOps5);
	return 1;
}
```

注意：T5中不能进行缩放和格式转换。而且要求目标图像和源图像的分辨率必须相同。