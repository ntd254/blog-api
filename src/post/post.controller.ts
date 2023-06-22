import {
  Body,
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../common/decorators/user.decorator';

@Controller('posts')
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('posts')
@ApiBearerAuth()
export class PostController {
  constructor(private readonly postsService: PostService) {}

  @Get('my-newsfeed')
  @ApiOperation({ summary: "Get my posts and following's post" })
  @ApiOkResponse({
    description: 'Return array of posts',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getPostsOfFollowingAndMy(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @User('id') userId: number,
  ) {
    return this.postsService.findPostOfFollowingAndMy(page, limit, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get posts' })
  @ApiOkResponse({
    description: 'Return array of posts',
  })
  getPosts(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('userId') userId: number,
  ) {
    return this.postsService.findPost(page, limit, userId);
  }

  @Get('my-posts')
  @ApiOperation({ summary: 'Get my posts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({
    description: 'Return array of posts',
  })
  getMyPosts(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @User('userId') userId: number,
  ) {
    return this.postsService.findMyPosts(page, limit, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail of a post by id' })
  @ApiOkResponse({
    description: 'Return post',
  })
  getDetailPost(@Param('id') postId: number) {
    return this.postsService.findPostById(postId);
  }

  @Post()
  @ApiOperation({ summary: 'Create post of authenticated user' })
  @ApiCreatedResponse({
    description: 'Return created post',
  })
  createPost(@User('id') userId, @Body() creatPostDto: CreatePostDto) {
    return this.postsService.createPost(creatPostDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update post by id' })
  @ApiOkResponse({
    description: 'Return updated post',
  })
  updatePost(
    @Param('id') postId: number,
    @User('id') userId: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePostById(postId, userId, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post by id' })
  @ApiOkResponse({
    description: 'Return deleted post',
  })
  deletePost(@Param('id') postId: number) {
    return this.postsService.deletePost(postId);
  }
}
