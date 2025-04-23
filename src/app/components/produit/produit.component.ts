import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../../services/produit.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewChild, TemplateRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html'
})
export class ProduitComponent implements OnInit {
  produits: any[] = [];
  totalPrixAchat: number = 0;
  totalPrixVente: number = 0;
  totalBenefice: number = 0;

  displayedColumns: string[] = [
    'nom', 'prixAchat', 'prixVente', 'quantite', 'stockRestant', 'prixTotalAchat', 'prixTotalVente', 'quantiteVendu', 'benefice', 'actions'
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  produit: any = {
    nom: '',
    prixAchat: 0,
    prixVente: 0,
    quantite: 0,
    stockRestant: 0
  };
  //chrger tous les produits
  getProduits(): void {
    this.produitService.getAll().subscribe(data => {
      this.produits = data; // <-- essentiel !
      this.dataSource.data = this.produits;
      this.dataSource.paginator = this.paginator;
      this.recalculerChamps();
    });
  }
  //
  constructor(private produitService: ProduitService ,private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getProduits();
    this.dataSource.data = this.produits;
  }
  //Ouvrir un popup
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  produitEnEdition: any = {}; // Copie locale pour édition dans le dialog
//supprimer dialogue
@ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
  // Ouvre le formulaire d’édition dans une popup
  editProduit(p: any): void {
    this.produitEnEdition = { ...p }; // clone pour ne pas modifier directement
    this.dialog.open(this.editDialog);
  }
  // Enregistre la modification
  saveEdit(): void {
    this.produitService.update(this.produitEnEdition).subscribe(() => {
      this.dialog.closeAll();
      this.getProduits();
    });
  }

 

  /** recalcul les champs aprés modification*/
  private recalculerChamps(): void {
    this.totalPrixAchat = 0;
    this.totalPrixVente = 0;
    this.totalBenefice = 0;

    this.produits.forEach(p => {
      p.prixAchat = p.prixAchat || 0;
      p.prixVente = p.prixVente || 0;
      p.quantite = p.quantite || 0;
      p.quantiteVendu = p.quantiteVendu || 0;

      p.stockRestant = p.quantite - p.quantiteVendu;
      p.prixTotalAchat = p.prixAchat * p.quantiteVendu;
      p.prixTotalVente = p.prixVente * p.quantiteVendu;
      p.benefice = p.prixTotalVente - p.prixTotalAchat;

      this.totalPrixAchat += p.prixTotalAchat;
      this.totalPrixVente += p.prixTotalVente;
      this.totalBenefice += p.benefice;
    });
  }




  saveProduit(): void {
    if (this.produit.id) {
      this.produitService.update(this.produit).subscribe(() => {
        this.resetForm();
        this.getProduits();
      });
    } else {
      this.produitService.create(this.produit).subscribe(() => {
        this.resetForm();
        this.getProduits();
      });
    }
  }

  /*editProduit(p: any): void {
    this.produit = { ...p };
  }*/

  deleteProduit(id: number): void {
    const dialogRef = this.dialog.open(this.confirmDialog, {
      width: '300px',
      data: {},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.produitService.delete(id).subscribe(() => this.getProduits());
      }
    });
  }

  resetForm(): void {
    this.produit = {
      nom: '',
      prixAchat: 0,
      prixVente: 0,
      quantite: 0,
      stockRestant: 0
    };
  }
  exporterPDF() {
    const url = 'http://localhost:8080/api/produits/export/pdf';
    window.open(url, '_blank');
  }


}