import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';


@Injectable()
export class ProductsService {
  constructor(private prisma:PrismaService){}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data:createProductDto
    })
    return product
  }

  async findAll(paginationDto:PaginationDto) {

    const {page,limit}=paginationDto

    const totalPages = await this.prisma.product.count({
      where:{
        available:true
      }
    })
    const lastPage = Math.ceil(totalPages/limit)

    const products = await this.prisma.product.findMany({
      skip:(page-1)*limit,
      take:limit,
      where:{
        available:true
      }
    })

    return {
      data:products,
      meta:{
        page:page,
        totalPages:totalPages,
        lastPage:lastPage
      }
    }
  }

  async findOne(id: number) {

    const product = await this.prisma.product.findUnique({
      where:{
        id,
        available:true
      }
    })
    if(!product) throw new BadRequestException(`the product with id: ${id} not found`)
    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id:_,...data}=updateProductDto

    await this.findOne(id)

    const product = await this.prisma.product.update({
      where:{
        id
      },
      data:data
    })

    return product
  }

  async remove(id: number) {
    await this.findOne(id)
    
    const product = await this.prisma.product.update({
      where:{id},
      data:{
        available:false
      }
    })

    return product
  }
}
