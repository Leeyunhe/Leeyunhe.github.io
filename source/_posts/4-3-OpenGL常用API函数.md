---
title: OpenGL常用API函数
date: 2023-4-14 21:44:11
categories: 笔记
tags: [嵌入式,OpenGL]
comments: false
description:
typora-root-url: 4-3-OpenGL常用API函数

---

## 1，GL常用

### 1.1.GL_BLEND

```c
	//开启混合，绘制带有透明度的纹理
	glEnable(GL_BLEND);//开启混合
	glDisable(GL_DEPTH_TEST);//关闭深度缓冲区，避免因alpha通道差异导致带透明度的纹理取消绘制
	glBlendFunc(GL_ONE_MINUS_DST_ALPHA, GL_DST_ALPHA);//设置混合方式（四选一）
	//glBlendFunc(GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA);
	//glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	//glBlendFunc(GL_DST_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	gldisable(GL_BLEND);//关闭混合
```

<!--more--> 

### 1.2.GL_DEPTH_TEST

```c
glEnable(GL_DEPTH_TEST);
1.启用了之后，OpenGL在绘制的时候就会检查，当前像素前面是否有别的像素，如果别的像素挡道了它，那它就不会绘制，也就是说，OpenGL就只绘制最前面的一层。
2.如果需要绘制带有透明度的纹理，则必须关闭深度缓冲区的检测
```

### 1.3.glClearColor&glClear()

```c
	glClearColor(0.0f, 0.0f, 0.0f, 0.0f);//(0.75f, 0.75f, 0.75f, 0.0f)
	glClear(GL_DEPTH_BUFFER_BIT | GL_COLOR_BUFFER_BIT); // (or whatever buffer you want to clear)

	1.glClearColor只起到Set的作用，并不Clear任何！glClearColor的作用是，指定刷新颜色缓冲区时所用的颜色。所以，完成一个刷新过程是要 glClearColor(COLOR) 与 glClear(GL_COLOR_BUFFER_BIT) 配合使用。
	2.glClear(GL_COLOR_BUFFER_BIT);glClear清除颜色缓冲区的作用是，防止缓冲区中原有的颜色信息影响本次绘图（注意！即使认为可以直接覆盖原值，也是有可能会影响的），当绘图区域为整个窗口时，就是通常看到的，颜色缓冲区的清除值就是窗口的背景颜色。所以，这两条清除指令并不是必须的：比如对于静态画面只需要设置一次，比如不需要背景色/背景色为白色。
	3. glClear 比手动涂抹一个背景画布效率高且省力，所以通常使用这种方式。
```

### 1.4.GL_SCISSOR_TEST

```c
	//清空指定区域颜色及深度	
	glEnable(GL_SCISSOR_TEST);//开启剪裁测试
	glScissor(window.x, window.y, window.width, window.height);//剪裁测试的区域
	glClearColor(0.0f, 0.0f, 0.0f, 0.0f);//纯黑色//(0.75f, 0.75f, 0.75f, 0.0f)灰色
	glClear(GL_DEPTH_BUFFER_BIT | GL_COLOR_BUFFER_BIT); // (or whatever buffer you want to clear)
	glDisable(GL_SCISSOR_TEST);//关闭剪裁测试
	
1.剪裁测试用于限制绘制区域。区域内的像素，将被绘制修改。区域外的像素，将不会被修改。
2.glScissor以左下角为坐标原点(0,0)，而通常情况下，坐标系以屏幕左上角为坐标原点(0,0)。因此，需要转换一下。
```

### 1.5.glCullFace()&GL_CULL_FACE

禁用多边形正面或者背面上的光照、阴影和颜色计算及操作，消除不必要的渲染计算 。 接受符号常量GL_FRONT、GL_BACK和GL_FRONT_AND_BACK。 默认值为GL_BACK
		如果mode的值为GL_FRONT_AND_BACK，那么多边形将不会被绘制到屏幕上，但其他图元如点和线还是会绘制到屏幕上的。 

```c
glEnable(GL_CULL_FACE);//启用分面剔除,默认剔除功能是关闭的。
glCullFace(GL_BACK);//设置后向分面剔除
glFrontFace(GL_CCW);//设置逆时针多边形作为正面

glDisable(GL_CULL_FACE);//关闭分面剔除
glCullFace(GL_BACK);
```

### 1.6.glFrontFace();  

 前面多边形的方向 。参数： GL_CW和GL_CCW。 默认值为GL_CCW。 

如果一个虚构的对象的顶点是按照多边形内部顺时针的方向进行绘制的，那么可以称这个多边形基于窗口坐标的投影是顺时针的。反之，则为逆时针。
glFrontFace就是用来指定多边形在窗口坐标中的方向是逆时针还是顺时针的。GL_CCW说明逆时针多边形为正面，而GL_CW说明顺时针多边形为正面。默认是逆时针多边形为正面

注： 在完全由不透明封闭表面组成的场景中，背面多边形从不可见。 消除这些不可见多边形具有加快图像呈现的明显优势。 

## 2、OpenGL核心函数库

glAccum 操作累加缓冲区
glAddSwapHintRectWIN 定义一组被 SwapBuffers 拷贝的三角形
glAlphaFunc 允许设置 alpha 检测功能
glAreTexturesResident 决定特定的纹理对象是否常驻在纹理内存中
glArrayElement 定义一个被用于顶点渲染的数组成分
glBegin,glEnd 定义一个或一组原始的顶点
glBindTexture 允许建立一个绑定到目标纹理的有名称的纹理
glBitmap 绘制一个位图
glBlendFunc 特殊的像素算法
glCallList 执行一个显示列表
glCallLists 执行一列显示列表
glClear 用当前值清除缓冲区
GlClearAccum 为累加缓冲区指定用于清除的值 
glClearColor 为色彩缓冲区指定用于清除的值 
glClearDepth 为深度缓冲区指定用于清除的值 
glClearStencil 为模板缓冲区指定用于清除的值 
glClipPlane 定义被裁剪的一个平面几何体 
glColor 设置当前色彩
glColorMask 允许或不允许写色彩组件帧缓冲区
glColorMaterial 使一个材质色彩指向当前的色彩
glColorPointer 定义一列色彩
glColorTableEXT 定义目的一个调色板纹理的调色板的格式和尺寸 
glColorSubTableEXT 定义目的纹理的调色板的一部分被替换
glCopyPixels 拷贝帧缓冲区里的像素
glCopyTexImage1D 将像素从帧缓冲区拷贝到一个单空间纹理图象中
glCopyTexImage2D 将像素从帧缓冲区拷贝到一个双空间纹理图象中
glCopyTexSubImage1D 从帧缓冲区拷贝一个单空间纹理的子图象 
glCopyTexSubImage2D 从帧缓冲区拷贝一个双空间纹理的子图象 
glCullFace 定义前面或后面是否能被精选
glDeleteLists 删除相邻一组显示列表
glDeleteTextures 删除命名的纹理
glDepthFunc 定义用于深度缓冲区对照的数据
glDepthMask 允许或不允许写入深度缓冲区 
glDepthRange 定义 z 值从标准的设备坐标映射到窗口坐标
glDrawArrays 定义渲染多个图元
glDrawBuffer 定义选择哪个色彩缓冲区被绘制
glDrawElements 渲染数组数据中的图元
glDrawPixels 将一组像素写入帧缓冲区
glEdgeFlag 定义一个边缘标志数组
glEdgeFlagPointer 定义一个边缘标志数组
glEnable, glDisable 打开或关闭 OpenGL 的特殊功能
glEnableClientState,glDisableClientState 分别打开或关闭数组 
glEvalCoord 求解一维和二维贴图
glEvalMesh1,glEvalMesh2 求解一维和二维点或线的网格
glEvalPoint1,glEvalPoint2 生成及求解一个网格中的单点 
glFeedbackBuffer 控制反馈模式
glFinish 等待直到 OpenGL 执行结束
glFlush 在有限的时间里强制 OpenGL 的执行
glFogf,glFogi,glFogfv,glFogiv 定义雾参数
glFrontFace 定义多边形的前面和背面
glFrustum 当前矩阵乘上透视矩阵
glGenLists 生成一组空的连续的显示列表
glGenTextures 生成纹理名称
glGetBooleanv,glGetDoublev,glGetFloatv,glGetIntegerv 返回值或所选参数值 
glGetClipPlane 返回特定裁减面的系数
glGetColorTableEXT 从当前目标纹理调色板得到颜色表数据 
glGetColorTableParameterfvEXT,glGetColorTableParameterivEXT 从颜色表中 得到调色板参数
glGetError 返回错误消息
glGetLightfv,glGetLightiv 返回光源参数值 
glGetMapdv,glGetMapfv,glGetMapiv 返回求值程序参数
glGetMaterialfv,glGetMaterialiv 返回材质参数 
glGetPixelMapfv,glGetpixelMapuiv,glGetpixelMapusv 返回特定的像素图
glGetPointerv 返回顶点数据数组的地址
glGetPolygonStipple 返回多边形的点图案
glGetString 返回描述当前 OpenGl 连接的字符串
glGetTexEnvfv 返回纹理环境参数
glGetTexGendv,glGetTexGenfv,glGetTexGeniv 返回纹理坐标生成参数
glGetTexImage 返回一个纹理图象 
glGetTexLevelParameterfv,glGetTexLevelParameteriv 返回特定的纹理参数的 细节级别
glGetTexParameterfv,glGetTexParameteriv 返回纹理参数值
glHint 定义实现特殊的线索
glIndex 建立当前的色彩索引
glIndexMask 控制写色彩索引缓冲区里的单独位
glIndexPointer 定义一个颜色索引数组
glInitName 初始化名字堆栈
glInterleavedArrays 同时定义和允许几个在一个大的数组集合里的交替数组 
glIsEnabled 定义性能是否被允许
glIsList 检测显示列表的存在
glIsTexture 确定一个名字对应一个纹理
glLightf,glLighti,glLightfv,glLightiv 设置光源参数 
glLightModelf,glLightModeli,glLightModelfv,glLightModeliv 设置光线模型参数
glLineStipple 设定线点绘图案
glLineWidth 设定光栅线段的宽
glListBase 为 glcallList 设定显示列表的基础
glLoadIdentity 用恒等矩阵替换当前矩阵
glLoadMatrixd,glLoadMatrif 用一个任意矩阵替换当前矩阵
glLoadName 将一个名字调入名字堆栈
glLogicOp 为色彩索引渲染定义一个逻辑像素操作
glMap1d,glMap1f 定义一个一维求值程序
glMap2d,glMap2f 定义一个二维求值程序
glMapGrid1d,glMapGrid1f,glMapgrid2d,glMapGrid2f 定义一个一维或二维网 格
glMaterialf,glMateriali,glMateriafv,glMaterialiv 为光照模型定义材质参数
glMatrixMode 定义哪一个矩阵是当前矩阵
glMultMatrixd,glMultMatrixf 用当前矩阵与任意矩阵相乘
glNewList,glEndList 创建或替换一个显示列表
glNormal 设定当前顶点法向
glNormalPointer 设定一个法向数组
glOrtho 用垂直矩阵与当前矩阵相乘
glPassThrough 在反馈缓冲区做记号
glPixelMapfv,glPixelMapuiv,glPixelMapusv 设定像素交换图
glPixelStoref,glpixelStorei 设定像素存储模式
glPixelTransferf,glPixelTransferi 设定像素存储模式
glPixelZoom 设定像素缩放因数
glPointSize 设定光栅点的直径
glPolygonMode 选择一个多边形的光栅模式
glPolygonOffset 设定 OpenGL 用于计算深度值的比例和单元
glPolygonStipple 设定多边形填充图案
glPrioritizeTextures 设定纹理固定的优先级
glPushAttrib,glPopAttrib 属性堆栈的压入和弹出操作
glPushClientAttrib,glPopClientAttrib 在客户属性堆栈存储和恢复客户状态值 
glPushmatrix,glPopMatrix 矩阵堆栈的压入和弹出操作
glPushName,glPopName 名字堆栈的压入和弹出操作
glRasterPos 定义像素操作的光栅位置
glreadBuffer 为像素选择一个源色彩缓冲区
glReadPixels 从帧缓冲区读取一组数据 
glRectd,glRectf,glRecti,glRects,glRectdv,glRectfv,glRectiv,glRectsv 绘制一个三 角形
glRenderMode 定义光栅模式
glRotated,glRotatef 将旋转矩阵与当前矩阵相乘
glScaled,glScalef 将一般的比例矩阵与当前矩阵相乘
glScissor 定义裁减框
glSelectBuffer 为选择模式值建立一个缓冲区
glShadeModel 选择平直或平滑着色
glStencilFunc 为模板测试设置功能和参照值
glStencilMask 控制在模板面写单独的位
glStencilOp 设置激活模式测试
glTexCoord 设置当前纹理坐标
glTexCoordPointer 定义一个纹理坐标数组 
glTexEnvf,glTexEnvi,glTexEnvfv,glTexEnviv 设定纹理坐标环境参数 
glTexGend,glTexgenf,glTexGendv,glTexGenfv,glTexGeniv 控制纹理坐标的生成
glTexImage1D 定义一个一维的纹理图象
glTexImage2D 定义一个二维的纹理图 
glTexParameterf,glTexParameteri,glTexParameterfv,glTexParameteriv 设置纹理参数
glTexSubImage1D 定义一个存在的一维纹理图像的一部分,但不能定义新的纹理
glTexSubImage2D 定义一个存在的二维纹理图像的一部分,但不能定义新的纹理
glTranslated,glTranslatef 将变换矩阵与当前矩阵相乘
glVertex 定义一个顶点
glVertexPointer 设定一个顶点数据数组
glViewport 设置视窗
