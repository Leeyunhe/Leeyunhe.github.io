---
title: OpenGl ES---VBO,VAO
date: 2023-4-14 21:50:11
categories: 笔记
tags: [嵌入式,OpenGL]
comments: false
description:
typora-root-url: 4-6-VBO与VAO

---

# OpenGl ES---VBO,VAO

## 1.简介

VBO,VAO和EBO:

- VBO(Vertex Buffer Object):顶点缓冲区对象

- VAO(顶点数组对象):顶点数组对象

- EBO（Element Buffer Object）:元素缓冲对象

  

  问：为什么要有VAO与VBO？

  ```c
  /*
  起因：
  在opengl es编程中，用于绘制的顶点数据首先保存在CPU内存，在调用glDrawArrays和 glDrawElements 等进行绘制时，需要将顶点数组数据从CPU内存拷贝到显存。我们没有必要每次绘制都去进行内存拷贝，若可以在显存中缓存这些数据，可以降低内存拷贝带来的开销。
  所以以上VBO,VAO出现就是为了解决这个问题。
  
  VBO,VAO作用：在显存中提前开辟好一块内存，用于缓存顶点数据
  */
  ```

<!--more-->

## 2.顶点数组数据和图元索引数据： 

```cpp
// 4 vertices, with(x,y,z) ,(r, g, b, a) per-vertex
GLfloat vertices[] =
		{
				-0.5f,  0.5f, 0.0f,       // v0
				1.0f,  0.0f, 0.0f,        // c0
				-0.5f, -0.5f, 0.0f,       // v1
				0.0f,  1.0f, 0.0f,        // c1
				0.5f, -0.5f, 0.0f,        // v2
				0.0f,  0.0f, 1.0f,        // c2
				0.5f,  0.5f, 0.0f,        // v3
				0.5f,  1.0f, 1.0f,        // c3
		};
// Index buffer data
GLushort indices[6] = { 0, 1, 2, 0, 2, 3};

/*由于顶点位置和颜色数据在同一个数组里，一起更新到VBO里面，需要知道2个属性的步长和偏移量。为获得数据队列中下一个属性值，需向右移动6个float,其中3个是位置值，另外3个是颜色值，所以步长为6*float的字节数。
同样，需要指定位置属性和颜色属性在VBO内存中的偏移量，对于每个顶点，位置属性在前，偏移量为0，颜色属性偏移量为3sizeof(GLfloat). 
*/
```

## 3.VBO的创建和更新：

### 1) glGenBuffers()

生成bufferID

### 2) glBindBuffer()

操作它，参数为VBO的bufferID

### 3) glBufferData()

指定里面放的数据和用法

至此想用此VBO时再glBindBuffer()它的bufferID即可，里面一般放顶点数据（包括模型的xyz和纹理坐标uv），另外前提是已经编译和设定好了shader的program

```cpp
//创建2个VBO
glGenBuffers(2, m_VboIds);
//绑定第一个VBO，拷贝顶点数组到显存
glBindBuffer(GL_ARRAY_BUFFER, m_VboIds[0]);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
//绑定第二个VBO，拷贝图元索引数据到显存
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_VboIds[1]);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
//GL_STATIC_DRAW 标志标识缓冲区对象数据被修改一次，使用多次，用于绘制。
```

## 4.使用VBO进行渲染： 

### 1) glBindBuffer()

操作想使用的VBO，参数为VBO的bufferID

### 2) glEnableVertexAttribArray()

启用与顶点相关的shader的量
		事先需要获取到它的handle，
		比如：
	maPositionHandle = GLES20.glGetAttribLocation(mProgram, “aPosition”);

### 3) glVertexAttribPointer ()

指定VBO里的数据的使用方法

这里有可能有多个glVertexAttribPointer ()，它的最后一个参数是使用时每个元素的偏移量，比如顶点是xyzuv的float顶点，每个4*5个字节重复一次，则分开指定xyz坐标和纹理坐标时，最后一个参数的值分别取0和12
另外，最后不适用VBO时，最后一个参数可以直接指定要渲染的缓冲区

### 4) glDrawArrays()

指定画法（一般为GL_TRIANGLES，即三角形），数量等，即可使用VBO进行绘制

### 5) glDrawElements()

这是另一种画法，可以通过指定顶点索引的方式来画图形
使用这种方法渲染时，应该生成两块VBO buffer，一个用来存放顶点信息，另一个来存放索引信息，和普通顶点VBO区别是，存放顶点的VBO应该在使用和指定数据时使用GL_ELEMENT_ARRAY_BUFFER，再使用glDrawElements(). 例如

```java
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mBufferHandle[1]); 
glBufferData(GL_ELEMENT_ARRAY_BUFFER,Count,buffer,GL_STATIC_DRAW); 
glDrawElements(GL_TRIANGLES,count,GL_UNSIGNED_SHORT, 0);
```

### es2.0 VBO例子

```c
glGenBuffers(VAO_NUM, obj->vert_VBO);//创建VBO
glBindBuffer(GL_ARRAY_BUFFER, *vert_VBO);//绑定VBO
glBufferData(GL_ARRAY_BUFFER, sizeof(GLfloat) * vert_elm_step * vert_rows, &vert_Data[0], GL_DYNAMIC_DRAW);//指定里面放的数据和用法，拷贝顶点数组到显存
//---------------------------------------------------
attribute vec4 position;//shader中的输入
//---------------------------------------------------
mPositionLocation = glGetAttribLocation(mProgram, "position");//获取到position的handle
glEnableVertexAttribArray(mPositionLocation);//启用与顶点相关的shader的量
glVertexAttribPointer(mPositionLocation, 4, GL_FLOAT, GL_FALSE, sizeof(Vertex), 0);//指定VBO里的数据的使用方法
```

### es3.0 VBO例子

```c
//顶点着色器
#version 300 es                            
layout(location = 0) in vec4 a_position;   // 位置变量的属性位置值为 0 
layout(location = 1) in vec3 a_color;      // 颜色变量的属性位置值为 1
out vec3 v_color;                          // 向片段着色器输出一个颜色                          
void main()                                
{                                          
    v_color = a_color;                     
    gl_Position = a_position;              
};

//片段着色器
#version 300 es
precision mediump float;
in vec3 v_color;
out vec4 o_fragColor;
void main()
{
    o_fragColor = vec4(v_color, 1.0);
}
//---------------------------------------------------
 //创建2个VBO
glGenBuffers(2, m_VboIds);
//绑定第一个VBO，拷贝顶点数组到显存
glBindBuffer(GL_ARRAY_BUFFER, m_VboIds[0]);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
//绑定第二个VBO，拷贝图元索引数据到显存
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_VboIds[1]);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

//---------------------------------------------------
glUseProgram(m_ProgramObj);
//---------------------------------------------------
//不使用 VBO 的绘制
glEnableVertexAttribArray(0);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, (3+3)*sizeof(GLfloat), vertices);

glEnableVertexAttribArray(1);
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, (3+3)*sizeof(GLfloat), (vertices + 3));

glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, indices);
//---------------------------------------------------
//使用 VBO 的绘制
glBindBuffer(GL_ARRAY_BUFFER, m_VboIds[0]);
glEnableVertexAttribArray(0);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, (3+3)*sizeof(GLfloat), (const void *)0);
glEnableVertexAttribArray(1);
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, (3+3)*sizeof(GLfloat), (const void *)(3 *sizeof(GLfloat)));

glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_VboIds[1]);

glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, (const void *)0);


```



## 6.VAO的创建和更新

 顶点数组对象，VAO作用：管理VBO，减少glBindBuffer,glEnableVertexAttribArray,glVertexAttribPointer这些调用操作。 

![](22.png)



### 1)	glGenVertexArrays()

### 2)	glBindVertexArray()

```cpp
// 创建并绑定 VAO
glGenVertexArrays(1, &m_VaoId);
glBindVertexArray(m_VaoId);

// 在绑定 VAO 之后，操作 VBO ，当前 VAO 会记录 VBO 的操作
glBindBuffer(GL_ARRAY_BUFFER, m_VboIds[0]);
glEnableVertexAttribArray(0);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, (3+3)*sizeof(GLfloat), (const void *)0);
glEnableVertexAttribArray(1);
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, (3+3)*sizeof(GLfloat), (const void *)(3 *sizeof(GLfloat)));

glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_VboIds[1]);

glBindVertexArray(GL_NONE);
```

##  7.使用VAO进行渲染：

```cpp
glUseProgram(m_ProgramObj);

glBindVertexArray(m_VaoId);

glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, (const void *)0);
```

## 8.如何让OpenES2.0支持VAO？

如果标准里没有定义一个函数, 可以用扩展的形式取得函数指针, 然后判断函数指针是否为空, 不为空就可以使用这个函数了.

例如: 获取 VAO的扩展, 这个在OpenGL2.0标准里没有定义, 只能通过扩展的形式取得.

如：

```cpp
#include <GLES2/gl2.h>
        /* VAO   获取VAO扩展 in opengl2.0*/
           PFNGLGENVERTEXARRAYSOESPROC glGenVertexArrays = (PFNGLGENVERTEXARRAYSOESPROC) eglGetProcAddress("glGenVertexArraysOES");
           PFNGLBINDVERTEXARRAYOESPROC glBindVertexArray = (PFNGLBINDVERTEXARRAYOESPROC) eglGetProcAddress("glBindVertexArrayOES");
           PFNGLDELETEVERTEXARRAYSOESPROC glDeleteVertexArrays = (PFNGLDELETEVERTEXARRAYSOESPROC) eglGetProcAddress("glDeleteVertexArraysOES");
```

OpenGL ES 扩展头文件GLES2/gl2ext.h

![](24.png)



### 用扩展的形式获取函数指针来支持VAO

![](23.jpg)

### 1）创建 VAO

(*pFNglGenVertexArraysOES)(VAO_NUM, obj->VAO);

### 2）绑定 VAO

pFNglbindvertexarrayOES(obj->VAO);

### 3）解绑 VAO

pFNglbindvertexarrayOES(0);//解绑 VAO



