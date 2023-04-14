---
title: OpenGL矩阵运算---GLM库的使用
date: 2023-4-14 21:55:11
categories: 笔记
tags: [嵌入式,OpenGL]
comments: false
description:
typora-root-url: 4-8-OpenGL矩阵运算-GLM库的使用
---

# OpenGL矩阵运算---GLM库的使用

## GLM库简介

OpenGL没有内建矩阵运算方法，常用的第三方库为GLM。GLM是OpenGL Mathematics的缩写。作为一个header only库，GLM只要包括了相应的头文件就可以使用它提供的类和函数。GLM是C++语言编写的，故不适用于C语言工程。

<!--more-->

## 头文件

- GLM对于矩阵数据类型的定义位于glm/glm.hpp头文件中。
- 生成变换矩阵的函数位于glm/gtc/matrix_transform.hpp头文件中。
- 生成投影矩阵的函数位于glm/ext/matrix_clip_space.hpp头文件中。
- 将数组转换成矩阵的函数位于头文件glm/gtc/type_ptr.hpp中。
- glm::value_ptr函数位于头文件glm/gtc/type_ptr.hpp中

## GLM常用数据类型

- vec2 二维向量
- vec3 三维向量
- vec4 四维向量
- mat2 二阶矩阵
- mat3 三阶矩阵
- mat4 四阶矩阵

## GLM常用函数

- glm::radians()

  角度制转弧度制，可应用于glm::rotate()中。

- glm::translate()

  返回一个平移矩阵，第一个参数是目标矩阵，第二个参数是平移的方向向量。

- glm::rotate()

  返回一个将点绕某个轴逆时针旋转一定弧度的旋转矩阵，第一个参数是弧度，第二个参数是旋转轴。

- glm::scale()

  返回一个缩放矩阵，第一个参数是目标矩阵，第二个参数是在各坐标轴上的缩放系数

- glm::ortho(float left, float right, float bottom, float top, float zNear, float zFar);

  正交投影矩阵。前四个参数分别是视口的左、右、上、下坐标。第五和第六个参数则定义了近平面和远平面的距离。

- glm::perspective(float fovy, float aspect, float zNear, float zFar);

  透视投影矩阵。第一个参数为视锥上下面之间的夹角，第二个参数为视口宽高比，第三、四个参数分别为近平面和远平面的深度。

- glm::value_ptr()

  传入一个矩阵，返回一个数组。

- glm::lookAt(eye, center, up) 

- 用于产生视图矩阵（view matrix）

  ```
  eye实际上就是摄像机的位置
  center就是摄像机的方向，您正在查看的位置(一个位置)，相机所看的点(场景的中心)
  up就是上轴，定义您世界的"向上"方向的向量
  
  eye -> cameraPos
  center -> cameraPos + cameraFront
  up -> cameraUp
  ```

  

## GLM矩阵的默认构造

GLM库从0.9.9版本起，默认会将矩阵类型初始化为一个零矩阵（所有元素均为0），而不是单位矩阵。如果使用0.9.9及以上的版本，需要在声明矩阵时传入参数1，例如glm::mat4 mat(1.0f)。

## 向着色器中输入矩阵

### glm::value_ptr函数

GLM的glm::value_ptr()函数可以返回一个数组，其中按列优先储存了矩阵的元素。例如：

```cpp
#include <glm/glm.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <iostream>
#include <typeinfo>

int main() {
	glm::mat4 trans(1.0f);
    trans = glm::rotate(trans, glm::radians(90.0f), glm::vec3(0, 1, 0));
    //0  0  1  0
	//0  1  0  0
	//-1 0  0  0
	//0  0  0  1
    float *p = glm::value_ptr(trans);
	std::cout << typeid(p).name() << std::endl;
	for (int i=0; i < 16; i++) {
		std::cout << *p << ' ';
		p++;
	}
	std::cout << std::endl;
	return 0;
}
//输出结果：
//float *
//0 0 -1 0 0 1 0 0 1 0 0 0 0 0 0 1

```

 我们可以用glm::value_ptr()搭配glUniformMatrix4fv函数向着色器传入矩阵： 

```cpp
glUniformMatrix4fv(glGetUniformLocation(ID, "name"), 1, GL_FALSE, glm::value_ptr(trans));
//ID为着色器程序的位置，glCreateProgram()的返回值
//name为自己在着色器中定义的uniform，如：uniform mat4 transform

```

### glUniform3Matrix4fv函数

void glUniformMatrix4fv (GLint location, GLsizei count, GLboolean transpose, const GLfloat * value)

- location: uniform的位置。
- count: 需要加载数据的数组元素的数量或者需要修改的矩阵的数量。
- transpose: 列优先矩阵传false,行优先矩阵传true。
- value: 指向由count个元素的数组的指针。

## GLSL中的向量*向量运算

需要注意的是，在GLSL中，vec4 * vec4是逐元乘法（component wise），例如：

```cpp
vec4 a = vec4(1.0, 2.0, 3.0, 4.0);
vec4 b = vec4(0.1, 0.2, 0.3, 0.4);
vec4 c = a * b;
//c: vec4(0.1, 0.4, 0.9, 1.6)
```

