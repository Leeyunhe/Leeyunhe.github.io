---
title: GLSL着色器语言
date: 2023-4-14 21:53:11
categories: 笔记
tags: [嵌入式,OpenGL]
comments: false
description:
typora-root-url: 4-7-GLSL着色器语言

---

# GLSL着色器语言

<!--more-->

## 1.OpenGL ES 2.0

（ES2.0也支持OES外部纹理）

```cpp
/***********************GLRender Normal texture***********************************/

static const char CommonVertshader_Normal[] =
//" #version 300 es \n "//着色器版本声明OpenGL ES 3.0
" #version 100 es \n "//不添加版本声明或者使用 #version 100 es 声明版本则指定使用 OpenGL ES 2.0
" precision mediump float;\n "//指定float类型默认的mediump中精度（-2^14 ~ 2^14）
    
//" layout(location = 0) in vec4 vPosition; \n "//输入vPosition顶点坐标
//" layout(location = 1) in vec2 vTexCoord; \n "//输入vTexCoord纹理坐标vec2
//" out vec3 TexCoord; \n "//输出纹理坐标vec3
" attribute vec4 vPosition; \n "//ES2.0中attribute，ES3.0中in
" attribute vec2 vTexCoord; \n "//ES2.0中attribute，ES3.0中in
" varying vec3 TexCoord; \n "//ES2.0中varying，ES3.0中out
    
" uniform mat4 mvp; \n"//uniform用于ES传入数据mvp
" void main() \n "//主函数
" { \n "
	"vec4 temPosition = mvp * vec4(vPosition.x, vPosition.y, vPosition.z, 1); \n"
    " gl_Position = vec4(temPosition.x, -temPosition.y, temPosition.z, temPosition.a); \n "//内建变量gl_Position顶点坐标
    " TexCoord = vec3(vTexCoord, vPosition.w); \n "
" } \n ";

static const char CommonFragshader_Normal[] =
//"#version 300 es \n"
"#extension GL_OES_EGL_image_external : require \n"//启用扩展（ES2.0也支持OES外部纹理）
" precision mediump float;\n "//Fragshader使用浮点型时必须指定精度，指定float类型默认的mediump中精度（-2^14 ~ 2^14）
    
//" in vec3 TexCoord; \n "//输入vTexCoord纹理坐标vec3,从Vertshader中传入的
//" out vec4 fragColor; \n "//输出片元颜色
" attribute vec3 TexCoord; \n "//ES2.0中attribute，ES3.0中in
" varying vec4 fragColor; \n "//ES2.0中varying，ES3.0中out
    
"uniform sampler2D myTexture;\n"//ES 2.0支持sample2D纹理和sampleCube纹理
" uniform vec4 myGain; \n "//uniform用于ES传入数据myGain
" void main() \n "//主函数
" {\n "
//"  		fragColor = vec4(texture(myTexture, TexCoord.xy).rgb, TexCoord.z)+vec4(myGain.xyz,0.0); \n "//2.25
"  		fragColor = vec4(texture(myTexture, TexCoord.xy).rgb, 1.0); \n "//2.25
//"	 fragColor = vec4(0.3, 0.4, 0.5, TexCoord.z)+vec4(myGain.xyz,0.0); \n "
" }\n ";
```



## 2.OpenGL ES 3.0

```cpp
/***********************GLRender Normal texture***********************************/

static const char CommonVertshader_Normal[] =
" #version 300 es \n "
" precision mediump float;\n "
" layout(location = 0) in vec4 vPosition; \n "
" layout(location = 1) in vec2 vTexCoord; \n "
" out vec3 TexCoord; \n "
" uniform mat4 mvp; \n"
" void main() \n "
" { \n "
	"vec4 temPosition = mvp * vec4(vPosition.x, vPosition.y, vPosition.z, 1); \n"
    " gl_Position = vec4(temPosition.x, -temPosition.y, temPosition.z, temPosition.a); \n "
    " TexCoord = vec3(vTexCoord, vPosition.w); \n "
" } \n ";

static const char CommonFragshader_Normal[] =
"#version 300 es \n"
#if (!VT_SAMPLE2D_SELECTED && !FIX_CAMERA_IMAGE)
"#extension GL_OES_EGL_image_external : require \n"
#endif
" precision mediump float;\n "
" in vec3 TexCoord; \n "
" out vec4 fragColor; \n "
#if (VT_SAMPLE2D_SELECTED || FIX_CAMERA_IMAGE)
"uniform sampler2D myTexture;\n"
#else
" uniform samplerExternalOES myTexture; \n "
#endif
" uniform vec4 myGain; \n "
" void main() \n "
" {\n "
//"  		fragColor = vec4(texture(myTexture, TexCoord.xy).rgb, TexCoord.z)+vec4(myGain.xyz,0.0); \n "//2.25
"  		fragColor = vec4(texture(myTexture, TexCoord.xy).rgb, 1.0); \n "//2.25
//"	 fragColor = vec4(0.3, 0.4, 0.5, TexCoord.z)+vec4(myGain.xyz,0.0); \n "
" }\n ";
```

## 3.着色器语言简介

OpenGLES的着色器语言GLSL是一种高级的图形化编程语言，其源自应用广泛的C语言。与传统的C语言不同的是，它提供了更加丰富的针对于图像处理的原生类型，诸如向量、矩阵之类。OpenGLES 主要包含以下特性：

- GLSL是一种面向过程的语言，和Java的面向对象是不同的。
- GLSL的基本语法与C/C++基本相同。
- 它完美的支持向量和矩阵操作。
- 它是通过限定符操作来管理输入输出类型的。
- GLSL提供了大量的内置函数来提供丰富的扩展功能。

## 4.数据类型

GLSL中的数据类型主要分为标量、向量、矩阵、采样器、结构体、数组、空类型七种类型：

- 标量：标量表示的是只有大小没有方向的量，在GLSL中标量只有bool、int和float三种。对于int，和C一样，可以写为十进制（16）、八进制（020）或者十六进制（0x10）。关于进制不了解的，得自己补补，这是编程基础。**对于标量的运算，我们最需要注意的是精度，防止溢出问题**。
- 向量：向量我们可以看做是数组，在GLSL通常用于储存颜色、坐标等数据，针对维数，可分为二维、三维和四位向量。针对存储的标量类型，可以分为bool、int和float。共有vec2、vec3、vec4，ivec2、ivec3、ivec4、bvec2、bvec3和bvec4九种类型，数组代表维数、i表示int类型、b表示bool类型。**需要注意的是，GLSL中的向量表示竖向量，所以与矩阵相乘进行变换时，矩阵在前，向量在后（与DirectX正好相反）**。向量在GPU中由硬件支持运算，比CPU快的多。

> 1. 作为颜色向量时，用rgba表示分量，就如同取数组的中具体数据的索引值。三维颜色向量就用rgb表示分量。比如对于颜色向量vec4 color，color[0]和color.r都表示color向量的第一个值，也就是红色的分量。其他相同。
> 2. 作为位置向量时，用xyzw表示分量，xyz分别表示xyz坐标，w表示向量的模。三维坐标向量为xyz表示分量，二维向量为xy表示分量。
> 3. 作为纹理向量时，用stpq表示分量，三维用stp表示分量，二维用st表示分量。

- 矩阵：在GLSL中矩阵拥有2*2、3*3、4*4三种类型的矩阵，分别用mat2、mat3、mat4表示。我们可以把矩阵看做是一个二维数组，也可以用二维数组下表的方式取里面具体位置的值。
- 采样器：采样器是专门用来对纹理进行采样工作的，在GLSL中一般来说，一个采样器变量表示一副或者一套纹理贴图。所谓的纹理贴图可以理解为我们看到的物体上的皮肤。
- 结构体：和C语言中的结构体相同，用struct来定义结构体，关于结构体参考C语言中的结构体。
- 数组：数组知识也和C中相同，不同的是数组声明时可以不指定大小，但是建议在不必要的情况下，还是指定大小的好。
- 空类型：空类型用void表示，仅用来声明不返回任何值得函数。

```c
float a=1.0;
int b=1;
bool c=true;
vec2 d=vec2(1.0,2.0);
vec3 e=vec3(1.0,2.0,3.0)
vec4 f=vec4(vec3,1.2);
vec4 g=vec4(0.2);  //相当于vec(0.2,0.2,0.2,0.2)
vec4 h=vec4(a,a,1.3,a);
mat2 i=mat2(0.1,0.5,1.2,2.4);
mat2 j=mat2(0.8);   //相当于mat2(0.8,0.8,0.8,0.8)
mat3 k=mat3(e,e,1.2,1.6,1.8);
```

## 5.运算符

GLSL中的运算符有（越靠前，运算优先级越高）：

1. 索引：[]
2. 前缀自加和自减：++，–
3. 一元非和逻辑非：~，！
4. 加法和减法：+，-
5. 等于和不等于：==，！=
6. 逻辑异或：^^
7. 三元运算符号，选择：？:
8. 成员选择与混合：.
9. 后缀自加和自减：++，–
10. 乘法和除法：*，/
11. 关系运算符：>，<，=，>=，<=，<>
12. 逻辑与：&&
13. 逻辑或：||
14. 赋值预算：=，+=，-=，*=，/=

## 6.类型转换

GLSL的类型转换与C不同。在GLSL中类型不可以自动提升，比如float a=1;就是一种错误的写法，必须严格的写成float a=1.0，也不可以强制转换，即float a=(float)1;也是错误的写法，但是可以用内置函数来进行转换，如float a=float(1);还有float a=float(true);（true为1.0，false为0.0）等，值得注意的是，**低精度的int不能转换为低精度的float**。

## 7.限定符

GLSL中的限定符号主要有：

- attritude：一般用于各个顶点各不相同的量。如顶点颜色、坐标等。
- uniform：一般用于对于3D物体中所有顶点都相同的量。比如光源位置，统一变换矩阵等。
- varying：表示易变量，一般用于顶点着色器传递到片元着色器的量。
- const：常量。

限定符与java限定符类似，放在变量类型之前，并且只能用于全局变量。在GLSL中，没有默认限定符一说。

## 8.流程控制

GLSL中的流程控制与C中基本相同，主要有：

```c
    if(){}、if(){}else{}、if(){}else if(){}else{}
    while(){}和do{}while()
    for(;;){}
    break和continue
```

## 9.函数

GLSL中也可以定义函数，定义函数的方式也与C语言基本相同。函数的返回值可以是GLSL中的除了采样器的任意类型。对于GLSL中函数的参数，可以用参数用途修饰符来进行修饰，常用修饰符如下：

- in：输入参数，无修饰符时默认为此修饰符。
- out：输出参数。
- inout：既可以作为输入参数，又可以作为输出参数。

## 10.浮点精度

与顶点着色器不同的是，在片元着色器中使用浮点型时，必须指定浮点类型的精度，否则编译会报错。精度有三种，分别为：

- lowp：低精度。8位。
- mediump：中精度。10位。
- highp：高精度。16位。

具体如下表：

![](21.webp)

不仅仅是float可以制定精度，其他（除了bool相关）类型也同样可以，但是int、采样器类型并不一定要求指定精度。加精度的定义如下：

```c
uniform lowp float a=1.0;
varying mediump vec4 c;
```

当然，也可以在片元着色器中设置默认精度，只需要在片元着色器最上面加上precision <精度> <类型>即可制定某种类型的默认精度。其他情况相同的话，精度越高，画质越好，使用的资源也越多。

```c
precision mediump float;
```

## 11.程序结构

GLSL程序的结构和C语言差不多，main()方法表示入口函数，可以在其上定义函数和变量，在main中可以引用这些变量和函数。定义在函数体以外的叫做全局变量，定义在函数体内的叫做局部变量。与高级语言不通的是，变量和函数在使用前必须声明，不能再使用的后面声明变量或者函数。

## 12.内建变量

在着色器中我们一般都会声明变量来在程序中使用，但是着色器中还有一些特殊的变量，不声明也可以使用。这些变量叫做内建变量。內建变量，相当于着色器硬件的输入和输出点，使用者利用这些输入点输入之后，就会看到屏幕上的输出。通过输出点可以知道输出的某些数据内容。当然，实际上肯定不会这样简单，这么说只是为了帮助理解。在顶点着色器中的内建变量和片元着色器的内建变量是不相同的。着色器中的内建变量有很多，在此，我们只列出最常用的集中内建变量。

 顶点着色器的内建变量

```undefined
输入变量：
    gl_Position：顶点坐标
    gl_PointSize：点的大小，没有赋值则为默认值1，通常设置绘图为点绘制才有意义。
```

片元着色器的内建变量

```cpp
1. 输入变量
    gl_FragCoord：当前片元相对窗口位置所处的坐标。
    gl_FragFacing：bool型，表示是否为属于光栅化生成此片元的对应图元的正面。

2. 输出变量
    gl_FragColor：当前片元颜色
    gl_FragData：vec4类型的数组。向其写入的信息，供渲染管线的后继过程使用。
```

## 13.常用内置函数

### 13.1常见函数

```css
    radians(x)：角度转弧度
    degrees(x)：弧度转角度
    sin(x)：正弦函数，传入值为弧度。相同的还有cos余弦函数、tan正切函数、asin反正弦、acos反余弦、atan反正切
    pow(x,y)：xy
    exp(x)：ex
    exp2(x)：2x
    log(x)：logex
    log2(x)：log2x
    sqrt(x)：x√
    inversesqr(x)：1x√
    abs(x)：取x的绝对值
    sign(x)：x>0返回1.0，x<0返回-1.0，否则返回0.0
    ceil(x)：返回大于或者等于x的整数
    floor(x)：返回小于或者等于x的整数
    fract(x)：返回x-floor(x)的值
    mod(x,y)：取模（求余）
    min(x,y)：获取xy中小的那个
    max(x,y)：获取xy中大的那个
    mix(x,y,a)：返回x∗(1−a)+y∗a
    step(x,a)：x< a返回0.0，否则返回1.0
    smoothstep(x,y,a)：a < x返回0.0，a>y返回1.0，否则返回0.0-1.0之间平滑的Hermite插值。
    dFdx(p)：p在x方向上的偏导数
    dFdy(p)：p在y方向上的偏导数
    fwidth(p)：p在x和y方向上的偏导数的绝对值之和
```

### 13.2几何函数

```css
    length(x)：计算向量x的长度
    distance(x,y)：返回向量xy之间的距离
    dot(x,y)：返回向量xy的点积
    cross(x,y)：返回向量xy的差积
    normalize(x)：返回与x向量方向相同，长度为1的向量
```

### 13.3矩阵函数

```css
    matrixCompMult(x,y)：将矩阵相乘
    lessThan(x,y)：返回向量xy的各个分量执行x< y的结果，类似的有greaterThan,equal,notEqual
    lessThanEqual(x,y)：返回向量xy的各个分量执行x<= y的结果，类似的有类似的有greaterThanEqual
    any(bvec x)：x有一个元素为true，则为true
    all(bvec x)：x所有元素为true，则返回true，否则返回false
    not(bvec x)：x所有分量执行逻辑非运算
```

### 13.4纹理采样函数

纹理采样函数有texture2D、texture2DProj、texture2DLod、texture2DProjLod、textureCube、textureCubeLod及texture3D、texture3DProj、texture3DLod、texture3DProjLod等。

```css
    texture表示纹理采样，2D表示对2D纹理采样，3D表示对3D纹理采样
    Lod后缀，只适用于顶点着色器采样
    Proj表示纹理坐标st会除以q
```

纹理采样函数中，3D在OpenGLES2.0并不是绝对支持。我们再次暂时不管3D纹理采样函数。重点只对texture2D函数进行说明。texture2D拥有三个参数，第一个参数表示纹理采样器。第二个参数表示纹理坐标，可以是二维、三维、或者四维。第三个参数加入后只能在片元着色器中调用，且只对采样器为mipmap类型纹理时有效。

## 14.attribute、uniform、varying、in、out

### 1.attribute:

根据OpenGL2.0和OpenGLES2.0标准，仅用在VertexShader中，至少支持8个attribute属性。OpenGL3.0里，至少支持16个。通常用来存储位置坐标、法向量、纹理坐标和颜色等。我们在上一阶段的OpenGL学习中每个Shader都有用到。 

```css
attribute vec4 position;
attribute vec4 color;
attribute vec4 texcoord;
attribute vec4 normal;
```

####  方法一：

在C++中先获取在哪个属性组： 

```css
mPositionLocation = glGetAttribLocation(mProgram, "position");
mColorLocation = glGetAttribLocation(mProgram, "color");
mTexcoordLocation = glGetAttribLocation(mProgram, "texcoord");
mNormalLocation = glGetAttribLocation(mProgram, "normal");
```

设置VBO与通用属性组关系：

```cpp
glEnableVertexAttribArray(mPositionLocation);
glVertexAttribPointer(mPositionLocation, 4, GL_FLOAT, GL_FALSE, sizeof(Vertex), 0);
glEnableVertexAttribArray(mColorLocation);
glVertexAttribPointer(mColorLocation, 4, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(sizeof(float) * 4));
glEnableVertexAttribArray(mTexcoordLocation);
glVertexAttribPointer(mTexcoordLocation, 4, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(sizeof(float) * 8));
glEnableVertexAttribArray(mNormalLocation);
glVertexAttribPointer(mNormalLocation, 4, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(sizeof(float) * 12));
```

#### 方法二：

```cpp
GLbyte vertexShaderSrc[] =
"attribute vec4 a_position; \n"
"attribute vec4 a_color; \n"
"varying vec4 v_color; \n"
"void main() \n"
"{ \n"
" v_color = a_color; \n"
" gl_Position = a_position; \n"
"}";
GLbyte fragmentShaderSrc[] =
"varying vec4 v_color; \n"
"void main() \n"
"{ \n"
" gl_FragColor = v_color; \n"
"}";
GLfloat color[4] = { 1.0f, 0.0f, 0.0f, 1.0f };
GLfloat vertexPos[3 * 3]; // 3 vertices, with (x,y,z) per-vertex
GLuint shaderObject[2];
GLuint programObject;
shaderObject[0] = LoadShader(vertexShaderSrc, GL_VERTEX_SHADER);
shaderObject[1] = LoadShader(fragmentShaderSrc, GL_FRAGMENT_SHADER);
programObject = glCreateProgram();
glAttachShader(programObject, shaderObject[0]);
glAttachShader(programObject, shaderObject[1]);

glVertexAttrib4fv(0, color);
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, vertexPos);
glEnableVertexAttribArray(1);
glBindAttribLocation(programObject, 0, "a_color");
glBindAttribLocation(programObject, 1, "a_position");
glLinkProgram(programObject);
glUseProgram(programObject);
glDrawArrays(GL_TRIANGLES, 0, 3);
```



### 2.unifrom:

可存在所有shader中，OpenGL2.0中，数量至少有128个。可存放矩阵、材质等任何attribute放不下的属性。

```css
uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat4 ProjectionMatrix;
```

在C++中，先获取位置：c

```css
mModelMatrixLocation = glGetUniformLocation(mProgram, "ModelMatrix");
mViewMatrixLocation = glGetUniformLocation(mProgram, "ViewMatrix");
mProjectionMatrixLocation = glGetUniformLocation(mProgram, "ProjectionMatrix");
```


设置参数：

```css
glUniformMatrix4fv(mModelMatrixLocation, 1, GL_FALSE, M);
glUniformMatrix4fv(mViewMatrixLocation, 1, GL_FALSE, V);
glUniformMatrix4fv(mProjectionMatrixLocation, 1, GL_FALSE, P);
```

### 3.varying:

用于shader之间的数据传递，在OpenGL2.0。最多传递8个Vec4大小的数据，即2个mat4矩阵。

```css
varying vec4 V_Texcoord;
```

### 4.in:

表示某个Shader阶段的输入。varying可以改为in。即fs中的输入为vs中的输出。

### 5.out:

代表每个shader的输出。也可以代替varying。in和out在3.0之后的版本使用。