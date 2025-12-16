import type { PostWithDetails, GroupWithMemberCount } from '@cyclists/config';

/**
 * Generate JSON-LD structured data for a blog post
 */
export function generatePostStructuredData(post: PostWithDetails) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.content.substring(0, 160),
    author: {
      '@type': 'Person',
      name: post.authorName,
      ...(post.authorAvatar && { image: post.authorAvatar }),
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    ...(post.images &&
      post.images.length > 0 && {
        image: post.images.map((img) => img.imageUrl),
      }),
    ...(post.keywords && {
      keywords: post.keywords,
    }),
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: post.replyCount,
    },
  };
}

/**
 * Generate JSON-LD structured data for a community group
 */
export function generateGroupStructuredData(group: GroupWithMemberCount & { images?: any[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: group.name,
    description: group.metaDescription || group.description,
    ...(group.mainImage && { logo: group.mainImage }),
    ...(group.city && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: group.city,
      },
    }),
    ...(group.keywords && {
      keywords: group.keywords,
    }),
    memberOf: {
      '@type': 'Organization',
      name: 'Cyclists Social Network',
    },
    // Note: Using aggregateRating as a proxy for community size
    // Schema.org doesn't have a standard "numberOfMembers" property
    member: Array(Math.min(group.memberCount, 5)).fill({
      '@type': 'Person',
    }),
  };
}
