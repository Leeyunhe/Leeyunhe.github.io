---
title: OpenGL ES 3.x概述
date: 2023-4-14 21:33:11
categories: 笔记
tags: [嵌入式,OpenGL]
comments: false
description:
typora-root-url: 4-2-OpenGL ES

---

# 一、OpenGL ES 3.x概述

OpenGL ES 是基于 OpenGL 三维图形 API 的子集，主要是针对手机以及 PDA（掌上电脑）等嵌入式设备设计的。 OpenGL ES 的 API 由 Khronos 组织定义并推广， Khronos 是一个图形软硬件行业协会，该协会致力于为这些 API 建立免费的开发标准。

## 1、 OpenGL ES3.x简介 

OpenGL 的应用领域较为广泛，适用于 UNIX、 Mac OS、 Linux 以及 Windows 等几乎所有的操作系统，可以开发游戏、工业建模以及嵌入式设备应用。

OpenGL ES 是专门针对嵌入式设备而设计的，其实际是 OpenGL 的剪裁版本，去除了OpenGL 中许多不是必须存在的特性，如 GL_QUADS（四边形）与 GL_POLYGONS（多边形）绘制模式以及 glBegin（开始） /glEnd（结束）操作等。

##  2.OpenGL与OpenGL-ES的主要区别：

<!--more--> 

之所以会推出OpenGL-ES版本，主要是应对嵌入式环境和应用的要求。

早先定义OpenGL ES是OpenGL的嵌入式设备版本，但由于嵌入式设备要求的是高性能，所以一些其它纯追求高性能的设备也开始用这种API方式，比如 SONY PlayStation 3。  

 OpenGL ES相对OpenGL删减了一切低效能的操作方式，有高性能的决不留低效能的，即只求效能不求兼容性。

嵌入式设备一般工作于较恶劣的环境，包括：温度、湿度、振动、冲击、酸碱腐蚀等。例如：中国的酸雨气候就给很多室外电子设备带来了新的难题，中东地区的风沙也使得美军必须采用更先进的非IT技术来保护他们的电子设备。 

需要人机界面的嵌入式应用，由于受环境受环境因素的影响，一般不能提供有缘电源，在有限的电能限制下工作，如何以更低的功耗完成人机交互界面，成为OpenGL必须要面对的问题，进而推出了OpenGL-ES标准。应该说在高效完成2D/3D界面的同时，达到了降低功耗的效果。 

##  3.OpenGL ES 1.0、2.0、3.0的区别 

### OpenGL ES1.0：

 针对固定管线硬件(fixed pipeline)，通过它内建的functions来设置诸如灯光、vertexes（图形的顶点数）、颜色、camera等等的东西。

### OpenGL ES2.0：

 针对可编程管线硬件(programmable pipeline)，需要自己动手编写任何功能。与此同时，2.0相比于1.0更具灵活性，功能也更强大。可以自定义顶点和像素计算，可以让表现方式更加准确。

### OpenGL ES3.0：

 OpenGL ES3.0扩展了OpenGL ES2.0，支持许多新的渲染技术、优化和显示质量改进，包括——引入了许多和纹理相关的新功能，对着色语言进行了重大更新和支持着色器新功能的API特性，引入了多种与几何形状规范和图元渲染控制相关的新功能，引入了新的缓冲区对象，增添了许多与屏幕外渲染到帧缓冲区对象相关的新功能。具体功能在后边的文章详细说明。（可能:））

###  OpenGL ES 3.0的向后兼容新 

OpenGL ES 3.0向后兼容OpenGL ES 2.0，但由于3.0/2.0不支持1.x支持的固定功能管线，3.0/2.0不能向后兼容1.x。

## 4.EGL/EAGL 

EGL API 参考页面:https://www.khronos.org/registry/EGL/sdk/docs/man/)

### 4.1作用

 EGL就是Embedded Graphics Library。嵌入式图形框架。 EGL是Khronos渲染API（如OpenGL ES）和原生窗口系统之间的接口（在iOS上则是EAGL）

### 4.2原因

OpenGL-ES 命令需要存储渲染上下文的状态和绘制表面的支持才能完成图形图像的绘制. 

- 渲染上下文：存储相关的OpenGL-ES 状态
- 绘制表面：是用于绘制图元的表面，它指定渲染所需的缓冲区类型，比如颜色缓冲区，深度缓冲区和模板缓冲区，绘制表面还需要指定所需缓冲区的位深度

因为OpenGL-ES API没有提及如何常见渲染上下文，或者渲染上下文如何连接到原生窗口系统，EGL就是 khronos 提出的OpenGL-ES 和原生窗口系统之间的接口；（ 唯⼀⽀持OpenGL ES 却不⽀持EGL 的平台是iOS。Apple 提供⾃⼰的EGL API的iOS实现,称为EAGL。 ）

###  4.3EGL的功能如下：

- 查询并初始化设备显示商的可用显示设备
- 创建渲染表面
   EGL创建的表面可用分为屏幕上的表面和屏幕外的表面，屏幕上的表面连接到原生窗口系统，屏幕外的表面不显示但是用作渲染表面的像素缓冲区
- 创建渲染上下文
   EGL 的最新版本时 EGL v1.4

### 4.4使用流程

任何OpenGL ES应用程序都必须在开始渲染之前使用EGL执行如下任务：

<img src="9.jpg" style="zoom: 80%;" />





## 5.OpenGL ES 3.0图形管线的各个阶段 

![](8.png)

![](10.jpg)

### 5.1顶点着色器

顶点和顶点着色器(Vertex & Vertex shader)，shader 是指运行在GPU可编程管线上的程序，也就是GPU所用的编程语言，本质是一种类C语言。
 Vertex shader 的内容包含：

- shader程序： 用来描述顶点上执⾏操作的顶点着⾊器程序源代码/可执⾏⽂件 

- shader 的输入属性，就是顶点数组提供的各个顶点的属性

- uniform(统一变量)  Vertex/Pixel shader 使用的不变的变量，如：颜色数据

- 采样器， 代表顶点着⾊器使⽤纹理的特殊统⼀变量类型。 

  ![](11.jpg)

 如图所示，可以由很多属性输入到顶点着色器，最后顶点着色器也会输出属性数据，其中gl_Position和gl_PointSize是OpenGL的内建变量。

在图元光栅化阶段，为每个生成的片段计算 vertex shader 的输出值，并作为输入值传递给pixel shader,
 **用于分配给每个图元顶点的Vertex shader输出每个片段值的机制被称为插值** 

### 5.2图元装配

图元(Primitive):  基本的图形对象 。如：点，线，三⻆形等。

图元装配: 将顶点数据计算成⼀个个图元.在这个阶段会执⾏裁剪、透视分割和Viewport变换操作。

  对于每个单独图元及其对应的顶点， 图元装配阶段执⾏的操作包括：将顶点着⾊器的输出值执⾏裁剪、透视分割、视⼝变换后进⼊光栅化阶段 

### 5.3光栅化

 光栅化是将**图元转换为一组二维片段的过程**，此后这些片段就会交给Pixel shader 处理，这些二维片段就是屏幕上可以绘制的像素。 

![](12.jpg)

### 5.4 **⽚元着⾊器/⽚段着⾊器** 

片段着色器（Pixel shader/Fragment shader）为片段操作实现了通用的可编程方法，它的组成如下：

- Shader 程序-- 描述⽚段上执⾏操作的⽚元着⾊器程序源代码/可执⾏⽂件 

- 输入变量--光栅化阶段用插值为每个片段生成的 Vertex shader 输出

- 输出变量-- 统⼀变量(uniform)--顶点/⽚元着⾊器使⽤的不变数据 

- 采样器--代表⽚元着⾊器使⽤纹理的特殊统⼀变量类型 

  ![](13.jpg)

### 5.5逐片段操作

![](14.webp)

- 像素归属测试: 确定帧缓存区中位置(Xw,Yw)的像素⽬前是不是归属于OpenGL ES所有. 例如,如果⼀个显示OpenGL ES帧缓存区View被另外⼀个View 所遮蔽.则窗⼝系统可以确定被遮蔽的像素不属于OpenGL ES 上下⽂.从⽽不全显示这些像素. ⽽像素归属测试是OpenGL ES 的⼀部分,它不由开发者开⼈为控制,⽽是由OpenGL ES 内部进⾏。
- 裁剪测试: 裁剪测试确定(Xw,Yw)是否位于作为OpenGL ES状态的⼀部分裁剪矩形范围内.如果该⽚段位于裁剪区域之外,则被抛弃。
- 深度测试: 输⼊⽚段的深度值进步⽐较,确定⽚段是否拒绝测试。
- 混合: 混合将新⽣成的⽚段颜⾊与保存在帧缓存的位置的颜⾊值组合起来。
- 抖动: 抖动可⽤于最⼩化因为使⽤有限精度在帧缓存区中保存颜⾊值⽽产⽣的伪像。

# 二、环境搭建

# 三、第一个OpenGL ES 3.0程序

```c
#include "esUtil.h"

typedef struct
{
   // Handle to a program object
   GLuint programObject;

} UserData;

///
// Create a shader object, load the shader source, and
// compile the shader.
//
GLuint LoadShader ( GLenum type, const char *shaderSrc )
{
   GLuint shader;
   GLint compiled;

   // Create the shader object,创建指定类型的新着色器对象
   shader = glCreateShader ( type );

   if ( shader == 0 )
   {
      return 0;
   }

   // Load the shader source着色器源代码本身用glShaderSource加载到着色器对象
   glShaderSource ( shader, 1, &shaderSrc, NULL );

   // Compile the shader着色器用glCompileShader函数编译
   glCompileShader ( shader );

   // Check the compile status确定编译的状态，打印输出生成的错误
   glGetShaderiv ( shader, GL_COMPILE_STATUS, &compiled );

   if ( !compiled )
   {
      GLint infoLen = 0;

      glGetShaderiv ( shader, GL_INFO_LOG_LENGTH, &infoLen );

      if ( infoLen > 1 )
      {
         char *infoLog = malloc ( sizeof ( char ) * infoLen );

         glGetShaderInfoLog ( shader, infoLen, NULL, infoLog );
         esLogMessage ( "Error compiling shader:\n%s\n", infoLog );

         free ( infoLog );
      }

      glDeleteShader ( shader );
      return 0;
   }

   return shader;//着色器编译成功，则返回一个新的着色器对象。

}

///
// Initialize the shader and program object
//
int Init ( ESContext *esContext )
{
   UserData *userData = esContext->userData;
    //顶点着色器
   char vShaderStr[] =
      "#version 300 es                          \n"
      "layout(location = 0) in vec4 vPosition;  \n"
      "void main()                              \n"
      "{                                        \n"
      "   gl_Position = vPosition;              \n"
      "}                                        \n";
	/*1.声明着色器版本；
	2.声明一个名为vPosition的4分量向量输入属性，layout（location=0）限定符表示这个变量的位置是顶点属性0；
	3.声明一个main函数，表示着色器执行的开始，{}中是着色器主体，将vPosition输入属性拷贝到名为gl_Position的特殊输出变量。每个顶点着色器必须在gl_Position变量中输出一个位置，这个变量定义传递到管线下一个阶段的位置。*/
    //片断着色器
   char fShaderStr[] =
      "#version 300 es                              \n"
      "precision mediump float;                     \n"
      "out vec4 fragColor;                          \n"
      "void main()                                  \n"
      "{                                            \n"
      "   fragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );  \n"
      "}                                            \n";

   GLuint vertexShader;
   GLuint fragmentShader;
   GLuint programObject;
   GLint linked;

   // Load the vertex/fragment shaders.编译和加载着色器
   vertexShader = LoadShader ( GL_VERTEX_SHADER, vShaderStr );
   fragmentShader = LoadShader ( GL_FRAGMENT_SHADER, fShaderStr );

   // Create the program object创建一个程序对象
   programObject = glCreateProgram ( );

   if ( programObject == 0 )
   {
      return 0;
   }
	//用glAttachShader将顶点着色器和片断着色器连接到对象上。
   glAttachShader ( programObject, vertexShader );
   glAttachShader ( programObject, fragmentShader );

   // Link the program连接程序
   glLinkProgram ( programObject );

   // Check the link status检查错误
   glGetProgramiv ( programObject, GL_LINK_STATUS, &linked );

   if ( !linked )
   {
      GLint infoLen = 0;

      glGetProgramiv ( programObject, GL_INFO_LOG_LENGTH, &infoLen );

      if ( infoLen > 1 )
      {
         char *infoLog = malloc ( sizeof ( char ) * infoLen );

         glGetProgramInfoLog ( programObject, infoLen, NULL, infoLog );
         esLogMessage ( "Error linking program:\n%s\n", infoLog );

         free ( infoLog );
      }

      glDeleteProgram ( programObject );
      return FALSE;
   }

   // Store the program object.保存程序对象。对象连接成功后，可以使用程序对象进行渲染，可以调用glUseProgram ( userData->programObject )来使用程序对象
   userData->programObject = programObject;

   glClearColor ( 1.0f, 1.0f, 1.0f, 0.0f );
   return TRUE;
}

///
// Draw a triangle using the shader pair created in Init()
//Draw回调函数用于绘制帧
void Draw ( ESContext *esContext )
{
   UserData *userData = esContext->userData;
   GLfloat vVertices[] = {  0.0f,  0.5f, 0.3f,
                            -0.5f, -0.5f, 0.5f,
                            0.5f, -0.5f, -0.4f
                         };

   // Set the viewport设置视口的原点和宽高
   glViewport ( 0, 0, esContext->width, esContext->height );

   // Clear the color buffer清除缓冲区，清除颜色为glClearColor指定的颜色
   glClear ( GL_COLOR_BUFFER_BIT );

   // Use the program object对象连接成功后，可以使用程序对象进行渲染
   glUseProgram ( userData->programObject );

   // Load the vertex data加载几何形状和绘制图元
    //三角形的顶点由vVertices数组中的三个坐标（x， y， z）指定。顶点位置使用glVertexAttribPointer加载到GL，并连接到顶点着色器生命的vPosition属性
   glVertexAttribPointer ( 0, 3, GL_FLOAT, GL_FALSE, 0, vVertices );
   glEnableVertexAttribArray ( 0 );

   glDrawArrays ( GL_TRIANGLES, 0, 3 );//告诉OpenGL ES绘制图元
}

void Shutdown ( ESContext *esContext )
{
   UserData *userData = esContext->userData;

   glDeleteProgram ( userData->programObject );
}
//应用程序的主入口。ESContext有一个名为userData、类型为void的成员变量，应用程序所需的所有数据保存在userData中
int esMain ( ESContext *esContext )
{
   esContext->userData = malloc ( sizeof ( UserData ) );//分配userData

   esCreateWindow ( esContext, "Hello Triangle", 375, 667, ES_WINDOW_RGB );//创建了窗口并初始化绘图回调函数
	//创建顶点着色器和片断着色器,OpenGL ES 3.0程序必须至少有一个顶点着色器和一个片断着色器。
   if ( !Init ( esContext ) )
   {
      return GL_FALSE;
   }

   esRegisterShutdownFunc ( esContext, Shutdown );
   esRegisterDrawFunc ( esContext, Draw );

   return GL_TRUE;
}
```

代码分析参见： [OpenGL ES 3.0 入门 - 简书 (jianshu.com)](https://www.jianshu.com/p/2ce67644eae8) 

## 代码流程框架1

<img src="16.jpg" style="zoom:80%;" />

## 代码流程框架2

![](19.jpg)

## 代码流程框架3

![](20.jpg)

# 四、OpenGL-ES 3.0/2.0 API查询网站

OpenGL-ES 3.0 API：https://www.khronos.org/registry/OpenGL-Refpages/es3.0/

OpenGL-ES 2.0 API：https://registry.khronos.org/OpenGL-Refpages/es2.0/

# 五、坐标系的转换

1、OpenGL坐标系

2、纹理坐标系

 2D纹理是一个图像数据的二维数组。一个纹理单独数据元素称作“纹素”(Texel)。图像中的每个纹素根据基本格式和数据类型指定。如果用2D纹理渲染时，纹理坐标用作图像中的索引。2D纹理的纹理坐标用一对2D坐标(s,t)或者(u,v)来表示，这些坐标用于查找一个纹理贴图的规范化坐标。 

![](18.webp)

 纹理图像的左下坐标由(0.0,0.0)决定，右上角坐标由(1.0,1.0)指定。在[0.0,1.0]之外的坐标是允许的，在区间之外的纹理读取行为由纹理包装模式决定。 

3、屏幕坐标系

![](17坐标系.png)

裁剪： 限制纹理坐标的取值范围来实现裁剪的效果 



# 六、纹理对象的创建与加载

## 1.本地资源

OpenCv读取，然后绑定纹理

```cpp
static int LoadTextures(void)
{
    string name;
    cv::Mat image;
	GLuint LoadingTexture；
        
    name = string("../" + "resource/Loadingpicture-" + to_string(1) + ".png";//读取UI文件资源路径
    image = cv::imread(name, cv::IMREAD_UNCHANGED);//OpenCv读取文件
    if(image.data == NULL)
    {
        PRINT("%s::%d Load Loadingpicture.png Failed \n",	__FILE__,  __LINE__);   
        return -1;
    }
    /* Genarate Texture  */
    glGenTextures(1, &LoadingTexture);//生成纹理名称
    glBindTexture(GL_TEXTURE_2D, LoadingTexture);//绑定指定纹理到目标
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA,image.cols, image.rows, 0, GL_RGBA, GL_UNSIGNED_BYTE, image.data);//指定2D纹理对象（目标纹理GL_TEXTURE_2D）
    /* Linear Filtering */
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
    glBindTexture(GL_TEXTURE_2D, 0);
    return 1;
｝
```

## 2.缓冲区资源

创建EGLImage对象，然后绑定纹理

```

```

