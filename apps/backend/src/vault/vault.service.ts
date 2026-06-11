import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class VaultService {
  constructor(private prisma: PrismaService) {}

  async getUserVaultItems(userId: number) {
    // Get all PAID order items that have an associated license
    const licenses = await this.prisma.license.findMany({
      where: { 
        userId,
        orderItem: {
          order: {
            status: 'PAID'
          }
        }
      },
      include: {
        orderItem: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const vaultItems = [];

    for (const lic of licenses) {
      let downloadUrl = null;
      let imageUrl = null;
      let description = null;

      // Fetch product details based on type to get the downloadUrl securely
      if (lic.orderItem.productType === 'THEME' || lic.orderItem.productType === 'TOOL') {
        const product = await this.prisma.themeTool.findUnique({
          where: { id: lic.orderItem.productId }
        });
        if (product) {
          downloadUrl = product.downloadUrl;
          imageUrl = product.imageUrl;
          description = product.description;
        }
      }

      vaultItems.push({
        id: lic.id,
        licenseKey: lic.licenseKey,
        status: lic.status,
        domain: lic.domain,
        productName: lic.orderItem.productName,
        productType: lic.orderItem.productType,
        purchasedAt: lic.createdAt,
        downloadUrl,
        imageUrl,
        description
      });
    }

    return vaultItems;
  }
}
